const CompanyProfile = require("../models/CompanyProfile");

// 🔹 CREATE PROFILE
exports.createCompanyProfile = async (req, res) => {
  try {
    const existingProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profil déjà existant",
      });
    }

    const profile = await CompanyProfile.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 GET MY PROFILE
exports.getMyCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({
      user: req.user._id,
    }).populate("user", "email role");

    if (!profile) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 UPDATE PROFILE
exports.updateCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};