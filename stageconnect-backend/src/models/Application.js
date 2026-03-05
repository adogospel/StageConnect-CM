const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    jobOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOffer",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔒 Empêche double candidature
applicationSchema.index(
  { student: 1, jobOffer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);