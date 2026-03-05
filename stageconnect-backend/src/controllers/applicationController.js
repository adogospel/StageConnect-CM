const Application = require("../models/Application");
const JobOffer = require("../models/JobOffer");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");
const Notification = require("../models/Notification");


// ===============================
// 🔹 POSTULER À UNE OFFRE (Student)
// ===============================
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, message } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID requis" });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ message: "Profil étudiant introuvable" });
    }

    const job = await JobOffer.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Offre introuvable ou inactive" });
    }

    // ✅ Vérifie double candidature
    const existingApplication = await Application.findOne({
      student: studentProfile._id,
      jobOffer: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre" });
    }

    // ✅ Créer candidature
    const application = await Application.create({
      student: studentProfile._id,
      jobOffer: jobId,
      message: message || "",
    });

    // ✅ Récupère le CompanyProfile lié à l'offre
    const companyProfile = await CompanyProfile.findById(job.company);
    if (!companyProfile) {
      return res.status(404).json({ message: "Profil entreprise introuvable" });
    }

    // ✅ Notification entreprise (DESTINATAIRE = companyProfile.user)
    await Notification.create({
      user: companyProfile.user, // ✅ FIX: obligatoire et correct
      title: "Nouvelle candidature",
      message: "Un étudiant a postulé à votre offre",
      type: "application_update", // ✅ dans ton enum
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("❌ APPLY ERROR:", error);

    // ✅ Si collision index unique (au cas où)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// 🔹 MES CANDIDATURES (Student)
// ===============================
exports.getMyApplications = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Profil étudiant introuvable" });
    }

    const applications = await Application.find({
      student: studentProfile._id,
    })
      .populate({
        path: "jobOffer",
        populate: {
          path: "company",
          select: "companyName city",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("❌ GET MY APPLICATIONS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// ===============================
// 🔹 CANDIDATS D’UNE OFFRE (Company)
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
        select: "firstName lastName university fieldOfStudy level city skills",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("❌ GET APPLICATIONS BY JOB ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// ===============================
// 🔹 ACCEPTER / REFUSER
// ===============================
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("jobOffer");

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable",
      });
    }

    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (
      application.jobOffer.company.toString() !==
      companyProfile._id.toString()
    ) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    application.status = status;
    await application.save();

    // 🔔 Notification étudiant
    const studentProfile = await StudentProfile.findById(
      application.student
    );

    await Notification.create({
      user: studentProfile.user,
      title: "Mise à jour candidature",
      message: `Votre candidature a été ${status}`,
      type: "application_update",
    });

    res.status(200).json({
      success: true,
      application,
    });

  } catch (error) {
    console.error("❌ UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};