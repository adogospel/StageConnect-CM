const express = require("express");
const router = express.Router();

const {
  createCompanyProfile,
  getMyCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/companyController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");

router.post(
  "/profile",
  protect,
  restrictToRole("company"),
  createCompanyProfile
);

router.get(
  "/profile/me",
  protect,
  restrictToRole("company"),
  getMyCompanyProfile
);

router.put(
  "/profile",
  protect,
  restrictToRole("company"),
  updateCompanyProfile
);

module.exports = router;