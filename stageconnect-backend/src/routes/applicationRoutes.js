const express = require("express");
const router = express.Router();

const {
  applyToJob,
  getMyApplications,
  getApplicationsByJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");

// ===============================
// STUDENT ROUTES
// ===============================
router.post("/", protect, restrictToRole("student"), applyToJob);
router.get("/me", protect, restrictToRole("student"), getMyApplications);

// ===============================
// COMPANY ROUTES
// ===============================
router.get(
  "/job/:jobId",
  protect,
  restrictToRole("company"),
  getApplicationsByJob
);

router.put(
  "/:id/status",
  protect,
  restrictToRole("company"),
  updateApplicationStatus
);

module.exports = router;