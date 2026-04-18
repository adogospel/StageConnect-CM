const Application = require("../models/Application");
const JobOffer = require("../models/JobOffer");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");
const Notification = require("../models/Notification");

// ===============================
// POSTULER À UNE OFFRE
// ===============================
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, message } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID requis" });
    }

    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Profil candidat introuvable" });
    }

    const job = await JobOffer.findById(jobId);

    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Offre introuvable ou inactive" });
    }

    const existingApplication = await Application.findOne({
      student: studentProfile._id,
      jobOffer: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "Vous avez déjà postulé à cette offre",
      });
    }

    let cvUrl = "";
    let cvOriginalName = "";

    if (req.file) {
      cvUrl = `/uploads/cvs/${req.file.filename}`;
      cvOriginalName = req.file.originalname;
    }

    const application = await Application.create({
      student: studentProfile._id,
      jobOffer: jobId,
      message: message || "",
      cvUrl,
      cvOriginalName,
      status: "pending",
    });

    // ✅ notifier le vrai user entreprise
    const companyProfile = await CompanyProfile.findById(job.company);

    if (companyProfile?.user) {
      await Notification.create({
        user: companyProfile.user,
        title: "Nouvelle candidature",
        message: "Un candidat a postulé à votre offre",
        type: "application_update",
        meta: {
          applicationId: application._id,
          jobId: job._id,
        },
      });
    }

    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("APPLY ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// MES CANDIDATURES
// ===============================
exports.getMyApplications = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Profil candidat introuvable" });
    }

    const applications = await Application.find({
      student: studentProfile._id,
    })
      .populate({
        path: "jobOffer",
        populate: {
          path: "company",
          select: "companyName city logoUrl",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// CANDIDATS D’UNE OFFRE
// ===============================
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({ message: "Profil entreprise introuvable" });
    }

    const job = await JobOffer.findById(jobId);

    if (!job || job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const applications = await Application.find({
      jobOffer: jobId,
    })
      .populate({
        path: "student",
        select:
          "user firstName lastName university fieldOfStudy level city phone skills summary candidateType activitySector yearsOfExperience highestEducation",
        populate: {
          path: "user",
          select: "email",
        },
      })
      .sort({ createdAt: -1 });

    const normalized = applications.map((app) => ({
      ...app.toObject(),
      student: app.student
        ? {
            ...app.student.toObject(),
            email: app.student.user?.email || "",
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      count: normalized.length,
      applications: normalized,
    });
  } catch (error) {
    console.error("GET APPLICATIONS BY JOB ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// DÉTAIL D’UNE CANDIDATURE
// ===============================
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: "student",
        select:
          "user firstName lastName university fieldOfStudy level city phone skills summary candidateType activitySector yearsOfExperience highestEducation",
        populate: {
          path: "user",
          select: "email",
        },
      })
      .populate("jobOffer");

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable",
      });
    }

    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    if (
      !application.jobOffer ||
      application.jobOffer.company.toString() !== companyProfile._id.toString()
    ) {
      return res.status(403).json({
        message: "Non autorisé",
      });
    }

    const normalized = {
      ...application.toObject(),
      student: application.student
        ? {
            ...application.student.toObject(),
            email: application.student.user?.email || "",
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      application: normalized,
    });
  } catch (error) {
    console.error("GET APPLICATION BY ID ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// UPDATE STATUS
// ===============================
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
      });
    }

    const application = await Application.findById(req.params.id).populate(
      "jobOffer"
    );

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable",
      });
    }

    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    if (application.jobOffer.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    application.status = status;
    await application.save();

    const studentProfile = await StudentProfile.findById(application.student);

    if (studentProfile?.user) {
      await Notification.create({
        user: studentProfile.user,
        title: "Mise à jour candidature",
        message: `Votre candidature a été ${status === "accepted" ? "acceptée" : "rejetée"}`,
        type: "application_update",
        meta: {
          applicationId: application._id,
          status,
        },
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};