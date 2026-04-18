const CompanyProfile = require("../models/CompanyProfile");
const Notification = require("../models/Notification");

exports.getCompaniesForReview = async (req, res) => {
  try {
    const status = req.query.status || "pending";

    const filters = {};
    if (status) {
      filters.verificationStatus = status;
    }

    const companies = await CompanyProfile.find(filters)
      .populate("user", "email role")
      .populate("verifiedBy", "email role")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("GET COMPANIES FOR REVIEW ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getCompanyReviewDetails = async (req, res) => {
  try {
    const company = await CompanyProfile.findById(req.params.id)
      .populate("user", "email role")
      .populate("verifiedBy", "email role");

    if (!company) {
      return res.status(404).json({ message: "Entreprise introuvable" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("GET COMPANY REVIEW DETAILS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Entreprise introuvable" });
    }

    if (!company.verificationDocs || company.verificationDocs.length === 0) {
      return res.status(400).json({
        message: "Aucun document trouvé pour cette entreprise.",
      });
    }

    company.verificationStatus = "verified";
    company.verificationNote = "Entreprise validée par l’administrateur.";
    company.isVerified = true;
    company.verifiedAt = new Date();
    company.verifiedBy = req.user._id;

    await company.save();

    await Notification.create({
      user: company.user,
      title: "Entreprise validée",
      message:
        "Tes documents ont été validés. Tu peux maintenant publier des offres d’emploi.",
      type: "company_verification_approved",
      meta: {
        companyId: company._id,
      },
    });

    res.status(200).json({
      message: "Entreprise approuvée avec succès",
      company,
    });
  } catch (error) {
    console.error("APPROVE COMPANY ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        message: "Le motif du rejet est requis.",
      });
    }

    const company = await CompanyProfile.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Entreprise introuvable" });
    }

    company.verificationStatus = "rejected";
    company.verificationNote = String(reason).trim();
    company.isVerified = false;
    company.verifiedAt = null;
    company.verifiedBy = req.user._id;

    await company.save();

    await Notification.create({
      user: company.user,
      title: "Vérification refusée",
      message: `Tes documents ont été rejetés. Motif : ${String(reason).trim()}`,
      type: "company_verification_rejected",
      meta: {
        companyId: company._id,
        reason: String(reason).trim(),
      },
    });

    res.status(200).json({
      message: "Entreprise rejetée avec succès",
      company,
    });
  } catch (error) {
    console.error("REJECT COMPANY ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};