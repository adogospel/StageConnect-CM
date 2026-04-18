const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    candidateType: {
      type: String,
      enum: ["student", "worker"],
      required: true,
      default: "student",
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

    city: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    cvUrl: {
      type: String,
      trim: true,
      default: "",
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // ✅ Étudiant
    university: {
      type: String,
      trim: true,
      required: function () {
        return this.candidateType === "student";
      },
    },

    fieldOfStudy: {
      type: String,
      trim: true,
      required: function () {
        return this.candidateType === "student";
      },
    },

    level: {
      type: String,
      trim: true,
      required: function () {
        return this.candidateType === "student";
      },
    },

    // ✅ Travailleur
    activitySector: {
      type: String,
      trim: true,
      required: function () {
        return this.candidateType === "worker";
      },
    },

    yearsOfExperience: {
      type: Number,
      required: function () {
        return this.candidateType === "worker";
      },
      default: 0,
      min: 0,
      max: 60,
    },

    highestEducation: {
      type: String,
      trim: true,
      required: function () {
        return this.candidateType === "worker";
      },
    },
  },
  { timestamps: true }
);

studentProfileSchema.index({ city: 1 });
studentProfileSchema.index({ candidateType: 1 });
studentProfileSchema.index({ fieldOfStudy: 1 });
studentProfileSchema.index({ activitySector: 1 });
studentProfileSchema.index({ skills: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);