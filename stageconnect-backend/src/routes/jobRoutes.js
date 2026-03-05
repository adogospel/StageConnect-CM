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

// ✅ Public
router.get("/", getAllJobs);

// ✅ Company routes (DOIVENT être avant "/:id")
router.get("/company/me", protect, restrictToRole("company"), getMyJobs);
router.post("/", protect, restrictToRole("company"), createJob);
router.put("/:id", protect, restrictToRole("company"), updateJob);
router.delete("/:id", protect, restrictToRole("company"), deleteJob);

// ✅ Single job public (DOIT être en dernier)
router.get("/:id", getJobById);

module.exports = router;