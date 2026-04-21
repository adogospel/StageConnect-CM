const express = require("express");
const router = express.Router();

const {
  searchSkills,
  createSkill,
} = require("../controllers/skillController");

// recherche suggestions
router.get("/", searchSkills);

// ajout nouvelle compétence
router.post("/", createSkill);

module.exports = router;