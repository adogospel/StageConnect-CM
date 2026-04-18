const express = require("express");
const router = express.Router();

const {
  getCompaniesForReview,
  getCompanyReviewDetails,
  approveCompany,
  rejectCompany,
} = require("../controllers/adminController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");

router.get(
  "/companies",
  protect,
  restrictToRole("admin"),
  getCompaniesForReview
);

router.get(
  "/companies/:id",
  protect,
  restrictToRole("admin"),
  getCompanyReviewDetails
);

router.put(
  "/companies/:id/approve",
  protect,
  restrictToRole("admin"),
  approveCompany
);

router.put(
  "/companies/:id/reject",
  protect,
  restrictToRole("admin"),
  rejectCompany
);

module.exports = router;