require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");

const app = express();

// 🔗 Connexion base de données
connectDB();


// 🔒 Middlewares globaux
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const companyRoutes = require("./src/routes/companyRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

// 🩺 Route test
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 StageConnect API is running...",
  });
});

// ⚠️ Gestion erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// 🚨 Middleware global d’erreur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0",() => {
  console.log(`🔥 API on ${PORT}`);
});