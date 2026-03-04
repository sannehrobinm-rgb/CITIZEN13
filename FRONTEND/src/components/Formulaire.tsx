// src/components/Formulaire.tsx
import React, { useState } from "react";

export default function Formulaire() {
  // --- États pour chaque champ ---
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [quartier, setQuartier] = useState("");
  const [intentionVote, setIntentionVote] = useState("");
  const [message, setMessage] = useState("");

  // --- Fonction d'envoi ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Préparer les données à envoyer
    const data = {
      nom_benevole: nom,
      email,
      quartier,
      intention_vote: intentionVote,
    };

    try {
      const res = await fetch("http://localhost:5005/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      // Réinitialiser les champs après envoi
      setNom("");
      setEmail("");
      setQuartier("");
      setIntentionVote("");
      setMessage("Formulaire envoyé avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'envoi du formulaire");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Formulaire Bénévole</h2>

      <form onSubmit={handleSubmit}>
        {/* Nom */}
        <label htmlFor="nom">Nom :</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
        />

        {/* Email */}
        <label htmlFor="email">Email :</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
        />

        {/* Quartier */}
        <label htmlFor="quartier">Quartier :</label>
        <input
          type="text"
          id="quartier"
          name="quartier"
          value={quartier}
          onChange={(e) => setQuartier(e.target.value)}
          required
          style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
        />

        {/* Intention de vote */}
        <label htmlFor="intention_vote">Intention de vote :</label>
        <select
          id="intention_vote"
          name="intention_vote"
          value={intentionVote}
          onChange={(e) => setIntentionVote(e.target.value)}
          required
          style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
        >
          <option value="">-- Choisir --</option>
          <option value="Pour">Pour</option>
          <option value="Contre">Contre</option>
          <option value="Indécis">Indécis</option>
        </select>

        {/* Bouton envoyer */}
        <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }}>
          Envoyer
        </button>
      </form>

      {/* Message de succès / erreur */}
      {message && <p style={{ marginTop: "10px", color: message.includes("Erreur") ? "red" : "green" }}>{message}</p>}
    </div>
  );
}
