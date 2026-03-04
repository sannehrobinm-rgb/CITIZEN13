import pkg from "pg";

import dotenv from "dotenv";
dotenv.config(); // ← Charger les variables d'environnement ICI

const { Pool } = pkg;
console.log("🔍 DATABASE_URL chargé:", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

});
