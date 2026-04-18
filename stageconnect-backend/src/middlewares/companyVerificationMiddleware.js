const CompanyProfile = require("../models/CompanyProfile");

exports.requireVerifiedCompany = async (req, res, next) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable. Crée d'abord ton profil.",
      });
    }

    if (!companyProfile.isVerified || companyProfile.verificationStatus !== "verified") {
      return res.status(403).json({
        message:
          "Entreprise non vérifiée. Tu ne peux pas publier d'offres pour le moment.",
      });
    }

    req.companyProfile = companyProfile;
    next();
  } catch (error) {
    console.error("VERIFY COMPANY MIDDLEWARE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};