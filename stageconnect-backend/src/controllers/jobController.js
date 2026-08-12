const JobOffer = require("../models/JobOffer");
const CompanyProfile = require("../models/CompanyProfile");

const CONTRACT_TYPES_WITH_DURATION = new Set([
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Temps partiel",
]);

const cleanText = (value = "") => {
  return String(value ?? "").trim();
};

const normalizeDeadline = (value) => {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return null;
  }

  return cleaned;
};

const normalizeSkills = (value) => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => cleanText(item)).filter(Boolean))
    );
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  /*
   * Avec FormData, le tableau peut arriver sous forme JSON.
   */
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(parsed.map((item) => cleanText(item)).filter(Boolean))
      );
    }
  } catch (_) {
    // La valeur n'est pas un JSON : on continue.
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => cleanText(item))
        .filter(Boolean)
    )
  );
};

const buildImagePayload = (file) => {
  if (!file) {
    return {};
  }

  return {
    imageUrl: `/uploads/job-images/${file.filename}`,
    imageOriginalName: file.originalname || "",
    imageMimeType: file.mimetype || "",
    imageSize: file.size || 0,
  };
};

const handleControllerError = (res, label, error) => {
  console.error(`${label}:`, error);

  if (
    error?.name === "ValidationError" ||
    error?.name === "CastError"
  ) {
    return res.status(400).json({
      message:
        error?.message ||
        "Certaines informations de l’offre sont invalides.",
    });
  }

  return res.status(500).json({
    message: "Erreur serveur",
  });
};

// ======================================================
// CREATE JOB
// ======================================================

exports.createJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({
        user: req.user._id,
      }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    if (
      !companyProfile.isVerified ||
      companyProfile.verificationStatus !== "verified"
    ) {
      return res.status(403).json({
        message: "Entreprise non vérifiée. Publication impossible.",
      });
    }

    const title = cleanText(req.body.title);
    const description = cleanText(req.body.description);
    const city = cleanText(req.body.city);
    const domain = cleanText(req.body.domain);
    const contractType = cleanText(req.body.contractType);
    const workMode = cleanText(req.body.workMode) || "Présentiel";
    const salary = cleanText(req.body.salary);

    if (!title || !description || !city || !domain || !contractType) {
      return res.status(400).json({
        message:
          "Le titre, la description, la ville, le domaine et le type de contrat sont requis.",
      });
    }

    const duration = CONTRACT_TYPES_WITH_DURATION.has(contractType)
      ? cleanText(req.body.duration)
      : "";

    const payload = {
      company: companyProfile._id,

      title,
      description,
      city,
      country: cleanText(req.body.country) || "Cameroun",
      domain,
      contractType,
      workMode,
      duration,
      salary,
      isPaid: Boolean(salary),

      skills: normalizeSkills(req.body.skills),

      requirements: cleanText(req.body.requirements),
      benefits: cleanText(req.body.benefits),

      deadline: normalizeDeadline(req.body.deadline),

      isActive: true,

      ...buildImagePayload(req.file),
    };

    const job = await JobOffer.create(payload);

    const populatedJob = await JobOffer.findById(job._id).populate(
      "company",
      "companyName city logoUrl isVerified verificationStatus"
    );

    return res.status(201).json(populatedJob);
  } catch (error) {
    return handleControllerError(res, "CREATE JOB ERROR", error);
  }
};

// ======================================================
// GET ALL JOBS
// ======================================================

exports.getAllJobs = async (req, res) => {
  try {
    const {
      city,
      domain,
      contractType,
      workMode,
      isPaid,
      q,
    } = req.query;

    const filters = {
      isActive: true,
    };

    if (city) {
      filters.city = {
        $regex: cleanText(city),
        $options: "i",
      };
    }

    if (domain) {
      filters.domain = {
        $regex: cleanText(domain),
        $options: "i",
      };
    }

    if (contractType) {
      filters.contractType = cleanText(contractType);
    }

    if (workMode) {
      filters.workMode = cleanText(workMode);
    }

    if (isPaid !== undefined) {
      filters.isPaid = String(isPaid) === "true";
    }

    if (q && cleanText(q)) {
      const search = cleanText(q);

      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requirements: { $regex: search, $options: "i" } },
        { benefits: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await JobOffer.find(filters)
      .populate(
        "company",
        "companyName city logoUrl isVerified verificationStatus"
      )
      .sort({
        isPremium: -1,
        createdAt: -1,
      });

    return res.status(200).json(jobs);
  } catch (error) {
    return handleControllerError(res, "GET ALL JOBS ERROR", error);
  }
};

// ======================================================
// GET JOB BY ID
// ======================================================

exports.getJobById = async (req, res) => {
  try {
    const job = await JobOffer.findById(req.params.id).populate(
      "company",
      "companyName city description logoUrl isVerified verificationStatus"
    );

    if (!job || !job.isActive) {
      return res.status(404).json({
        message: "Offre non trouvée",
      });
    }

    return res.status(200).json(job);
  } catch (error) {
    return handleControllerError(res, "GET JOB BY ID ERROR", error);
  }
};

// ======================================================
// UPDATE JOB
// ======================================================

exports.updateJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({
        user: req.user._id,
      }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Offre non trouvée",
      });
    }

    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        message: "Non autorisé",
      });
    }

    const updatedPayload = {};

    const textFields = [
      "title",
      "description",
      "city",
      "country",
      "domain",
      "contractType",
      "workMode",
      "requirements",
      "benefits",
    ];

    textFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updatedPayload[field] = cleanText(req.body[field]);
      }
    });

    if (Object.prototype.hasOwnProperty.call(req.body, "skills")) {
      updatedPayload.skills = normalizeSkills(req.body.skills);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "salary")) {
      const salary = cleanText(req.body.salary);

      updatedPayload.salary = salary;
      updatedPayload.isPaid = Boolean(salary);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "deadline")) {
      updatedPayload.deadline = normalizeDeadline(req.body.deadline);
    }

    const effectiveContractType =
      updatedPayload.contractType || job.contractType;

    if (CONTRACT_TYPES_WITH_DURATION.has(effectiveContractType)) {
      if (Object.prototype.hasOwnProperty.call(req.body, "duration")) {
        updatedPayload.duration = cleanText(req.body.duration);
      }
    } else {
      updatedPayload.duration = "";
    }

    if (req.file) {
      Object.assign(updatedPayload, buildImagePayload(req.file));
    }

    if (String(req.body.removeImage || "") === "true") {
      updatedPayload.imageUrl = "";
      updatedPayload.imageOriginalName = "";
      updatedPayload.imageMimeType = "";
      updatedPayload.imageSize = 0;
    }

    const updatedJob = await JobOffer.findByIdAndUpdate(
      req.params.id,
      updatedPayload,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "company",
      "companyName city logoUrl isVerified verificationStatus"
    );

    return res.status(200).json(updatedJob);
  } catch (error) {
    return handleControllerError(res, "UPDATE JOB ERROR", error);
  }
};

// ======================================================
// DELETE JOB
// ======================================================

exports.deleteJob = async (req, res) => {
  try {
    const companyProfile =
      req.companyProfile ||
      (await CompanyProfile.findOne({
        user: req.user._id,
      }));

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const job = await JobOffer.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Offre non trouvée",
      });
    }

    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        message: "Non autorisé",
      });
    }

    job.isActive = false;
    await job.save();

    return res.status(200).json({
      message: "Offre désactivée",
      jobId: job._id,
    });
  } catch (error) {
    return handleControllerError(res, "DELETE JOB ERROR", error);
  }
};

// ======================================================
// GET MY COMPANY JOBS
// ======================================================

exports.getMyJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({
      user: req.user._id,
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Profil entreprise introuvable. Crée d'abord ton profil.",
      });
    }

    const jobs = await JobOffer.find({
      company: companyProfile._id,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(jobs);
  } catch (error) {
    return handleControllerError(res, "GET MY JOBS ERROR", error);
  }
};