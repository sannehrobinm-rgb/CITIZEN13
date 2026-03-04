import express from "express";
import type { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import formsRouter from "./routes/forms";
import { pool } from "./db;

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/forms", formsRouter);

// Test serveur
app.get("/", (_, res) => {res.send("Backend fonctionne 🚀")});

// Test DB
(async () => {
  try {
    const now = await pool.query("SELECT NOW()");
    console.log("✅ Connecté à PostgreSQL:", now.rows[0].now);
  } catch (err) {
    console.error("❌ Erreur connexion DB", err);
  }
})();

// Lancement serveur
app.listen(PORT, () => console.log(`🚀 Serveur backend en écoute sur http://localhost:${PORT}`));
