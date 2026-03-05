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
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    contractType: {
      type: String,
      enum: ["Stage académique", "Stage pro", "Job étudiant", "Alternance"],
      required: true,
    },
    duration: {
      type: String,
    },
    salary: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
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

// Index pour filtres
jobOfferSchema.index({ city: 1 });
jobOfferSchema.index({ domain: 1 });
jobOfferSchema.index({ contractType: 1 });
jobOfferSchema.index({ isPaid: 1 });
jobOfferSchema.index({ createdAt: -1 });

module.exports = mongoose.model("JobOffer", jobOfferSchema);