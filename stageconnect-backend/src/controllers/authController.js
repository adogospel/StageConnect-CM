const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 Générer token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 📝 REGISTER
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,

      // student required fields
      firstName,
      lastName,
      university,
      fieldOfStudy,
      level,
      city,

      // optionnels
      skills,
      phone,
      cvUrl,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (!["student", "company"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // ✅ Validation si student
    if (role === "student") {
      const missing = [];
      if (!firstName) missing.push("firstName");
      if (!lastName) missing.push("lastName");
      if (!university) missing.push("university");
      if (!fieldOfStudy) missing.push("fieldOfStudy");
      if (!level) missing.push("level");
      if (!city) missing.push("city");

      if (missing.length) {
        return res.status(400).json({
          message: `Champs requis pour étudiant: ${missing.join(", ")}`,
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    // ✅ Créer StudentProfile si student
    if (role === "student") {
      await StudentProfile.create({
        user: user._id,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        university: String(university).trim(),
        fieldOfStudy: String(fieldOfStudy).trim(),
        level: String(level).trim(),
        city: String(city).trim(),
        skills: Array.isArray(skills) ? skills : [],
        phone,
        cvUrl,
      });
    }

    return res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔐 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};