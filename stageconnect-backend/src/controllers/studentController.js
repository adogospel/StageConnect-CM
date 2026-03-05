const StudentProfile = require("../models/StudentProfile");

// 🔹 CREATE PROFILE
exports.createStudentProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profil déjà existant",
      });
    }

    const profile = await StudentProfile.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 GET MY PROFILE
exports.getMyStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
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
exports.updateStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
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