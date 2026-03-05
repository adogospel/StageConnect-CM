const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    university: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    city: {
      type: String,
      required: true,
    },
    cvUrl: {
      type: String,
    },
    phone: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index pour recherche rapide
studentProfileSchema.index({ city: 1 });
studentProfileSchema.index({ fieldOfStudy: 1 });
studentProfileSchema.index({ skills: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);