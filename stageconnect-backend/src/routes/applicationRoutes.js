const express = require("express");
const router = express.Router();

const {
  applyToJob,
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");
const { uploadCV } = require("../middlewares/uploadMiddleware");

// student
router.post(
  "/",
  protect,
  restrictToRole("student"),
  uploadCV.single("cv"),
  applyToJob
);

router.get("/me", protect, restrictToRole("student"), getMyApplications);

// company
router.get("/job/:jobId", protect, restrictToRole("company"), getApplicationsByJob);
router.get("/:id", protect, restrictToRole("company"), getApplicationById);
router.put("/:id/status", protect, restrictToRole("company"), updateApplicationStatus);

module.exports = router;