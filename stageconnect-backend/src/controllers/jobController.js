const JobOffer = require("../models/JobOffer");
const CompanyProfile = require("../models/CompanyProfile");

// 🔹 CREATE JOB (Company only)
exports.createJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const job = await JobOffer.create({
      company: companyProfile._id,
      ...req.body,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 GET ALL JOBS (Public + Filters)
exports.getAllJobs = async (req, res) => {
  try {
    const { city, domain, contractType, isPaid } = req.query;

    let filters = { isActive: true };

    if (city) filters.city = city;
    if (domain) filters.domain = domain;
    if (contractType) filters.contractType = contractType;
    if (isPaid !== undefined) filters.isPaid = isPaid;

    const jobs = await JobOffer.find(filters)
      .populate("company", "companyName city")
      .sort({ isPremium: -1, createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 GET SINGLE JOB
exports.getJobById = async (req, res) => {
  try {
    const job = await JobOffer.findById(req.params.id)
      .populate("company", "companyName city description");

    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 UPDATE JOB (Owner only)
exports.updateJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (!companyProfile || job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const updatedJob = await JobOffer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 DELETE JOB (Soft delete)
exports.deleteJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (!companyProfile || job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({ message: "Offre désactivée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 GET MY COMPANY JOBS
exports.getMyJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    const jobs = await JobOffer.find({
      company: companyProfile._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};