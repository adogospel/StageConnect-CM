const mongoose = require("mongoose");

const CONTRACT_TYPES_WITH_DURATION = [
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Temps partiel",
];

const jobOfferSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
      index: true,
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
        "Temps partiel",
      ],
      required: true,
    },

    workMode: {
      type: String,
      enum: ["Présentiel", "Hybride", "Remote"],
      default: "Présentiel",
    },

    /*
     * La durée reste optionnelle.
     * Elle est automatiquement vidée pour CDI.
     */
    duration: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    salary: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    skills: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    /*
     * Champs optionnels :
     * ils ne seront affichés côté candidat que lorsqu’ils sont renseignés.
     */
    requirements: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    benefits: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    /*
     * Flyer optionnel de l’offre.
     * Ces champs peuvent rester vides pour les anciennes offres.
     */
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    imageOriginalName: {
      type: String,
      trim: true,
      default: "",
    },

    imageMimeType: {
      type: String,
      trim: true,
      default: "",
    },

    imageSize: {
      type: Number,
      default: 0,
      min: 0,
      max: 5 * 1024 * 1024,
    },

    deadline: {
      type: Date,
      default: null,
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

/*
 * Sécurité métier :
 * si le contrat ne nécessite pas de durée, on la retire.
 */
jobOfferSchema.pre("validate", function () {
  if (!CONTRACT_TYPES_WITH_DURATION.includes(this.contractType)) {
    this.duration = "";
  }
});

jobOfferSchema.index({ city: 1 });
jobOfferSchema.index({ domain: 1 });
jobOfferSchema.index({ contractType: 1 });
jobOfferSchema.index({ workMode: 1 });
jobOfferSchema.index({ isPaid: 1 });
jobOfferSchema.index({ isActive: 1 });
jobOfferSchema.index({ createdAt: -1 });

module.exports = mongoose.model("JobOffer", jobOfferSchema);