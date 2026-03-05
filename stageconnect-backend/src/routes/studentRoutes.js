const express = require("express");
const router = express.Router();

const {
  createStudentProfile,
  getMyStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");

router.post(
  "/profile",
  protect,
  restrictToRole("student"),
  createStudentProfile
);

router.get(
  "/profile/me",
  protect,
  restrictToRole("student"),
  getMyStudentProfile
);

router.put(
  "/profile",
  protect,
  restrictToRole("student"),
  updateStudentProfile
);

module.exports = router;