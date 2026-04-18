const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const {
  createCompanyProfile,
  getMyCompanyProfile,
  updateCompanyProfile,
  uploadVerificationDocuments,
} = require("../controllers/companyController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictToRole } = require("../middlewares/roleMiddleware");

const uploadDir = path.join("uploads", "company-verification");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(null, `${Date.now()}-${safeBaseName}${ext}`);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Type de fichier non autorisé. PDF/JPG/PNG/WEBP uniquement.")
      );
    }
    cb(null, true);
  },
});

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

router.post(
  "/verification/upload",
  protect,
  restrictToRole("company"),
  upload.array("documents", 5),
  uploadVerificationDocuments
);

module.exports = router;