import type { Request, Response } from "express";
import { pool } from "../db.js";

export const submitForm = async (req: Request, res: Response) => {
  const formData = req.body;
  console.log("📝 Formulaire reçu:", formData);

  try {
    const query = `INSERT INTO formulaires (nom, prenom, email) VALUES ($1, $2, $3) RETURNING id`;
    const values = [formData.nom, formData.prenom, formData.email];

    const result = await pool.query(query, values);
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const getForms = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM formulaires ORDER BY id DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const createForm = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};