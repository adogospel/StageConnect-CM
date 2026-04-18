const mongoose = require("mongoose");

const verificationDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      trim: true,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },

    documentType: {
      type: String,
      enum: ["rccm", "niu", "taxpayer_card", "other"],
      default: "other",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    sector: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },

    verificationNote: {
      type: String,
      trim: true,
      default: "",
    },

    verificationDocs: {
      type: [verificationDocumentSchema],
      default: [],
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

companyProfileSchema.index({ city: 1 });
companyProfileSchema.index({ sector: 1 });
companyProfileSchema.index({ verificationStatus: 1 });
companyProfileSchema.index({ isVerified: 1 });

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);