const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI lu :", process.env.MONGO_URI?.slice(0, 20));

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;