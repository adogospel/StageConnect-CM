require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const companyRoutes = require("./src/routes/companyRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const skillRoutes = require("./src/routes/skillRoutes");

const app = express();

// Utile si l’API est ensuite hébergée derrière Render ou un proxy.
app.set("trust proxy", 1);

// Connexion MongoDB
connectDB();

// Middlewares globaux
app.use(cors());

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// Accès public aux fichiers uploadés
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Route de test
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 StageConnect API is running...",
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skills", skillRoutes);

// Route inexistante
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Le fichier ne doit pas dépasser 5 Mo.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Champ de fichier inattendu.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Erreur pendant l’envoi du fichier.",
    });
  }

  if (err?.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Erreur serveur",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 API on ${PORT}`);
});