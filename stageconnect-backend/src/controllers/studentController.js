const StudentProfile = require("../models/StudentProfile");

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
    console.error("CREATE STUDENT PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

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
    console.error("GET STUDENT PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const current = await StudentProfile.findOne({ user: req.user._id });

    if (!current) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    const nextCandidateType = req.body.candidateType || current.candidateType;

    const updated = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        ...req.body,
        candidateType: nextCandidateType,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE STUDENT PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};