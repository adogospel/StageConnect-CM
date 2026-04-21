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

// ===============================
// SEARCH SKILLS
// ===============================
exports.searchSkills = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    const filter = { isActive: true };

    if (q) {
      filter.normalizedName = {
        $regex: normalizeSkillName(q),
        $options: "i",
      };
    }

    const skills = await Skill.find(filter)
      .sort({ usageCount: -1, name: 1 })
      .limit(12)
      .select("_id name slug usageCount");

    return res.status(200).json(skills);
  } catch (error) {
    console.error("SEARCH SKILLS ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// CREATE SKILL
// ===============================
exports.createSkill = async (req, res) => {
  try {
    const rawName = String(req.body?.name || "").trim();

    if (!rawName) {
      return res.status(400).json({ message: "Nom de compétence requis." });
    }

    const formattedName = formatSkillName(rawName);
    const normalizedName = normalizeSkillName(rawName);
    const slug = slugifySkill(rawName);

    let skill = await Skill.findOne({ normalizedName });

    if (skill) {
      skill.usageCount = (skill.usageCount || 0) + 1;
      if (!skill.isActive) skill.isActive = true;
      if (skill.name !== formattedName) skill.name = formattedName;
      await skill.save();

      return res.status(200).json(skill);
    }

    skill = await Skill.create({
      name: formattedName,
      normalizedName,
      slug,
      usageCount: 1,
      isActive: true,
    });

    return res.status(201).json(skill);
  } catch (error) {
    if (error?.code === 11000) {
      try {
        const existing = await Skill.findOne({
          normalizedName: normalizeSkillName(req.body?.name || ""),
        });

        if (existing) {
          return res.status(200).json(existing);
        }
      } catch (_) {}

      return res.status(400).json({ message: "Cette compétence existe déjà." });
    }

    console.error("CREATE SKILL ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};