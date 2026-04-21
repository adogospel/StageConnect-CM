const StudentProfile = require("../models/StudentProfile");
const Skill = require("../models/Skill");

const normalizeSkillName = (value = "") => {
  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
};

const formatSkillName = (value = "") => {
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const slugifySkill = (value = "") => {
  return normalizeSkillName(value).replace(/\s+/g, "-");
};

const syncSkillsCatalog = async (skills = []) => {
  const cleanedSkills = Array.from(
    new Set(
      (Array.isArray(skills) ? skills : [])
        .map((item) => formatSkillName(item))
        .filter(Boolean)
    )
  );

  for (const skillName of cleanedSkills) {
    const normalizedName = normalizeSkillName(skillName);
    const slug = slugifySkill(skillName);

    const existingSkill = await Skill.findOne({ normalizedName });

    if (existingSkill) {
      existingSkill.usageCount = (existingSkill.usageCount || 0) + 1;
      if (!existingSkill.isActive) existingSkill.isActive = true;
      if (existingSkill.name !== skillName) existingSkill.name = skillName;
      await existingSkill.save();
    } else {
      await Skill.create({
        name: skillName,
        normalizedName,
        slug,
        usageCount: 1,
        isActive: true,
      });
    }
  }

  return cleanedSkills;
};

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

    const finalSkills = await syncSkillsCatalog(req.body.skills || []);

    const profile = await StudentProfile.create({
      ...req.body,
      user: req.user._id,
      phone: req.body.phone ? String(req.body.phone).trim() : "",
      skills: finalSkills,
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

    const payload = {
      ...req.body,
      candidateType: nextCandidateType,
    };

    if (req.body.phone !== undefined) {
      payload.phone = String(req.body.phone || "").trim();
    }

    if (req.body.skills !== undefined) {
      payload.skills = await syncSkillsCatalog(req.body.skills);
    }

    const updated = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      payload,
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE STUDENT PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};