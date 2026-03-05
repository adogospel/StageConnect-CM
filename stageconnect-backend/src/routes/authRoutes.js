const express = require("express");
const router = express.Router();

// ✅ Import correct : le module exporte directement { register, login, ... }
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;