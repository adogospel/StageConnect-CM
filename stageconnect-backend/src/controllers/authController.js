const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const splitFullName = (fullName = "") => {
  const cleaned = String(fullName).trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "", lastName: "" };

  const parts = cleaned.split(" ");
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
};

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,

      // sécurité admin
      adminSecret,

      // mobile existing field
      fullName,
      firstName,
      lastName,
      city,
      phone,
      skills,
      candidateType,
      university,
      fieldOfStudy,
      level,
      activitySector,
      yearsOfExperience,
      highestEducation,
    } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Tous les champs principaux sont requis." });
    }

    if (!["student", "company", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    // sécurité : création admin contrôlée
    if (role === "admin") {
      if (
        !adminSecret ||
        adminSecret !== process.env.ADMIN_REGISTRATION_SECRET
      ) {
        return res.status(403).json({
          message: "Création admin non autorisée.",
        });
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    let resolvedFirstName = firstName;
    let resolvedLastName = lastName;

    if ((!resolvedFirstName || !resolvedLastName) && fullName) {
      const split = splitFullName(fullName);
      resolvedFirstName = resolvedFirstName || split.firstName;
      resolvedLastName = resolvedLastName || split.lastName;
    }

    // ✅ Validation candidat
    if (role === "student") {
      if (!candidateType || !["student", "worker"].includes(candidateType)) {
        return res.status(400).json({
          message: "candidateType requis : student ou worker.",
        });
      }

      const commonMissing = [];
      if (!resolvedFirstName) commonMissing.push("firstName");
      if (!resolvedLastName) commonMissing.push("lastName");
      if (!city) commonMissing.push("city");

      if (candidateType === "student") {
        if (!university) commonMissing.push("university");
        if (!fieldOfStudy) commonMissing.push("fieldOfStudy");
        if (!level) commonMissing.push("level");
      }

      if (candidateType === "worker") {
        if (!activitySector) commonMissing.push("activitySector");
        if (
          yearsOfExperience === undefined ||
          yearsOfExperience === null ||
          yearsOfExperience === ""
        ) {
          commonMissing.push("yearsOfExperience");
        }
        if (!highestEducation) commonMissing.push("highestEducation");
      }

      if (commonMissing.length) {
        return res.status(400).json({
          message: `Champs requis pour candidat : ${commonMissing.join(", ")}`,
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    // ✅ Création auto du profil candidat
    if (role === "student") {
      await StudentProfile.create({
        user: user._id,
        candidateType,
        firstName: String(resolvedFirstName).trim(),
        lastName: String(resolvedLastName).trim(),
        city: String(city).trim(),
        phone: phone ? String(phone).trim() : "",
        skills: Array.isArray(skills) ? skills : [],
        university:
          candidateType === "student" ? String(university).trim() : undefined,
        fieldOfStudy:
          candidateType === "student" ? String(fieldOfStudy).trim() : undefined,
        level: candidateType === "student" ? String(level).trim() : undefined,
        activitySector:
          candidateType === "worker"
            ? String(activitySector).trim()
            : undefined,
        yearsOfExperience:
          candidateType === "worker" ? Number(yearsOfExperience) : undefined,
        highestEducation:
          candidateType === "worker"
            ? String(highestEducation).trim()
            : undefined,
      });
    }

    // ✅ Création optionnelle profil entreprise vide plus tard ?
    // Ici on ne le crée pas automatiquement pour ne pas casser ton flow actuel.
    // L'entreprise complètera son profil via l'écran dédié.

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

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Compte bloqué." });
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

// ===============================
// GET ME
// ===============================
exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    let profile = null;

    if (user.role === "student") {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    if (user.role === "company") {
      profile = await CompanyProfile.findOne({ user: user._id });
    }

    if (user.role === "admin") {
      profile = null;
    }

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};