const mongoose = require("mongoose");

const jobOfferSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Cameroun",
      trim: true,
    },

    domain: {
      type: String,
      required: true,
      trim: true,
    },

    contractType: {
      type: String,
      enum: [
        "Stage",
        "CDD",
        "CDI",
        "Freelance",
        "Alternance",
        "Temps plein",
        "Temps partiel",
      ],
      required: true,
    },

    workMode: {
      type: String,
      enum: ["Présentiel", "Hybride", "Remote"],
      default: "Présentiel",
    },

    duration: {
      type: String,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: ["Junior", "Intermédiaire", "Senior", "Sans expérience"],
      default: "Sans expérience",
    },

    salary: {
      type: String,
      trim: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    deadline: {
      type: Date,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobOfferSchema.index({ city: 1 });
jobOfferSchema.index({ domain: 1 });
jobOfferSchema.index({ contractType: 1 });
jobOfferSchema.index({ workMode: 1 });
jobOfferSchema.index({ isPaid: 1 });
jobOfferSchema.index({ isActive: 1 });
jobOfferSchema.index({ createdAt: -1 });

module.exports = mongoose.model("JobOffer", jobOfferSchema);