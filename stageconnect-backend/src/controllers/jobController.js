const JobOffer = require("../models/JobOffer");
const CompanyProfile = require("../models/CompanyProfile");

exports.createJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({ user: req.user._id }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    if (
      !companyProfile.isVerified ||
      companyProfile.verificationStatus !== "verified"
    ) {
      return res.status(403).json({
        message: "Entreprise non vérifiée. Publication impossible.",
      });
    }

    const payload = {
      ...req.body,
      company: companyProfile._id,
      isPaid: Boolean(req.body.salary && String(req.body.salary).trim()),
      isActive: true,
    };

    const job = await JobOffer.create(payload);

    res.status(201).json(job);
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { city, domain, contractType, workMode, isPaid, q } = req.query;

    const filters = { isActive: true };

    if (city) filters.city = city;
    if (domain) filters.domain = domain;
    if (contractType) filters.contractType = contractType;
    if (workMode) filters.workMode = workMode;
    if (isPaid !== undefined) filters.isPaid = isPaid === "true";

    if (q) {
      filters.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { domain: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    const jobs = await JobOffer.find(filters)
      .populate(
        "company",
        "companyName city logoUrl isVerified verificationStatus"
      )
      .sort({ isPremium: -1, createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("GET ALL JOBS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await JobOffer.findById(req.params.id).populate(
      "company",
      "companyName city description logoUrl isVerified verificationStatus"
    );

    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("GET JOB BY ID ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({ user: req.user._id }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const updatedPayload = {
      ...req.body,
      isPaid: Boolean(req.body.salary && String(req.body.salary).trim()),
    };

    const updatedJob = await JobOffer.findByIdAndUpdate(
      req.params.id,
      updatedPayload,
      { new: true }
    );

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({ user: req.user._id }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({
      message: "Offre désactivée",
      jobId: job._id,
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable. Crée d'abord ton profil.",
      });
    }

    const jobs = await JobOffer.find({
      company: companyProfile._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("GET MY JOBS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};