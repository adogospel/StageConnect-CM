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

const {
  uploadJobImage,
} = require("../middlewares/uploadMiddleware");

// ======================================================
// ROUTES PUBLIQUES
// ======================================================

router.get("/", getAllJobs);

/*
 * Cette route doit rester avant /:id.
 */
router.get(
  "/company/me",
  protect,
  restrictToRole("company"),
  getMyJobs
);

router.get("/:id", getJobById);

// ======================================================
// ENTREPRISE VÉRIFIÉE
// ======================================================

router.post(
  "/",
  protect,
  restrictToRole("company"),
  requireVerifiedCompany,
  uploadJobImage.single("image"),
  createJob
);

router.put(
  "/:id",
  protect,
  restrictToRole("company"),
  requireVerifiedCompany,
  uploadJobImage.single("image"),
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