const path = require("path");
const CompanyProfile = require("../models/CompanyProfile");
const Notification = require("../models/Notification");
const User = require("../models/User");

exports.createCompanyProfile = async (req, res) => {
  try {
    const existingProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profil déjà existant",
      });
    }

    const profile = await CompanyProfile.create({
      user: req.user._id,
      companyName: req.body.companyName,
      sector: req.body.sector,
      city: req.body.city,
      address: req.body.address,
      phone: req.body.phone,
      logoUrl: req.body.logoUrl,
      description: req.body.description,
      verificationStatus: "not_submitted",
      verificationNote: "",
      verificationDocs: [],
      isVerified: false,
      verifiedAt: null,
      verifiedBy: null,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("CREATE COMPANY PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getMyCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({
      user: req.user._id,
    })
      .populate("user", "email role")
      .populate("verifiedBy", "email role");

    if (!profile) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("GET COMPANY PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  try {
    const current = await CompanyProfile.findOne({ user: req.user._id });

    if (!current) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    const shouldResetVerification =
      (req.body.companyName && req.body.companyName !== current.companyName) ||
      (req.body.sector && req.body.sector !== current.sector) ||
      (req.body.city && req.body.city !== current.city) ||
      (req.body.address && req.body.address !== current.address) ||
      (req.body.phone && req.body.phone !== current.phone);

    const updatePayload = {
      companyName: req.body.companyName ?? current.companyName,
      sector: req.body.sector ?? current.sector,
      city: req.body.city ?? current.city,
      address: req.body.address ?? current.address,
      phone: req.body.phone ?? current.phone,
      logoUrl: req.body.logoUrl ?? current.logoUrl,
      description: req.body.description ?? current.description,
    };

    if (shouldResetVerification && current.isVerified) {
      updatePayload.isVerified = false;
      updatePayload.verificationStatus = "not_submitted";
      updatePayload.verificationNote =
        "Le profil a été modifié. Merci de renvoyer les documents de vérification.";
      updatePayload.verifiedAt = null;
      updatePayload.verifiedBy = null;
    }

    const updated = await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      updatePayload,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE COMPANY PROFILE ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.uploadVerificationDocuments = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({
        message: "Aucun document envoyé",
      });
    }

    const docs = req.files.map((file) => {
      const normalizedPath = file.path.replace(/\\/g, "/");

      return {
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl: `/${normalizedPath}`,
        mimeType: file.mimetype,
        size: file.size,
        documentType: req.body.documentType || "other",
        uploadedAt: new Date(),
      };
    });

    profile.verificationDocs = docs;
    profile.verificationStatus = "pending";
    profile.verificationNote = "Documents envoyés. En attente de validation admin.";
    profile.isVerified = false;
    profile.verifiedAt = null;
    profile.verifiedBy = null;

    await profile.save();

    const admins = await User.find({ role: "admin", isBlocked: false }).select("_id");

    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user: admin._id,
        title: "Nouvelle entreprise à vérifier",
        message: `${profile.companyName} a envoyé des documents de vérification.`,
        type: "company_verification_submitted",
        meta: {
          companyId: profile._id,
          companyName: profile.companyName,
          submittedBy: req.user._id,
        },
      }));

      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      message: "Documents envoyés avec succès. Vérification en attente.",
      profile,
    });
  } catch (error) {
    console.error("UPLOAD VERIFICATION DOCUMENTS ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};