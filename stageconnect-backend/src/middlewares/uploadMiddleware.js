const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const uploadsRoot = path.join(__dirname, "../../uploads");
const cvUploadDir = path.join(uploadsRoot, "cvs");
const jobImageUploadDir = path.join(uploadsRoot, "job-images");

[uploadsRoot, cvUploadDir, jobImageUploadDir].forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

function sanitizeFileName(fileName = "file") {
  return String(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function generateFileName(file, prefix) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  const baseName =
    sanitizeFileName(
      path.basename(file.originalname || "file", extension)
    ) || "file";

  const randomPart = Math.round(Math.random() * 1e9);

  return `${prefix}-${Date.now()}-${randomPart}-${baseName}${extension}`;
}

function createStorage(destination, prefix) {
  return multer.diskStorage({
    destination(req, file, callback) {
      callback(null, destination);
    },

    filename(req, file, callback) {
      callback(null, generateFileName(file, prefix));
    },
  });
}

function createUploadError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// ======================================================
// CV
// ======================================================

const allowedCvMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedCvExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
]);

function cvFileFilter(req, file, callback) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  const validMimeType = allowedCvMimeTypes.has(file.mimetype);
  const validExtension = allowedCvExtensions.has(extension);

  if (!validMimeType || !validExtension) {
    return callback(
      createUploadError(
        "Format de CV non autorisé. Utilise PDF, DOC ou DOCX."
      )
    );
  }

  callback(null, true);
}

const uploadCV = multer({
  storage: createStorage(cvUploadDir, "cv"),
  fileFilter: cvFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 20,
    parts: 25,
  },
});

// ======================================================
// FLYER D’OFFRE
// ======================================================

const allowedJobImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const allowedJobImageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

function jobImageFileFilter(req, file, callback) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  const validMimeType = allowedJobImageMimeTypes.has(file.mimetype);
  const validExtension = allowedJobImageExtensions.has(extension);

  if (!validMimeType || !validExtension) {
    return callback(
      createUploadError(
        "Format d’image non autorisé. Utilise JPG, JPEG, PNG, WEBP ou GIF."
      )
    );
  }

  callback(null, true);
}

const uploadJobImage = multer({
  storage: createStorage(jobImageUploadDir, "job"),
  fileFilter: jobImageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 30,
    parts: 35,
  },
});

module.exports = {
  uploadCV,
  uploadJobImage,
  MAX_FILE_SIZE,
};