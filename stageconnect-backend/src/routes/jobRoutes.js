const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require("../controllers/jobController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");
const {
  requireVerifiedCompany,
} = require("../middlewares/companyVerificationMiddleware");

// public
router.get("/", getAllJobs);
router.get("/company/me", protect, restrictToRole("company"), getMyJobs);
router.get("/:id", getJobById);

// company only + verified
router.post(
  "/",
  protect,
  restrictToRole("company"),
  requireVerifiedCompany,
  createJob
);

router.put(
  "/:id",
  protect,
  restrictToRole("company"),
  requireVerifiedCompany,
  updateJob
);

router.delete(
  "/:id",
  protect,
  restrictToRole("company"),
  requireVerifiedCompany,
  deleteJob
);

module.exports = router;