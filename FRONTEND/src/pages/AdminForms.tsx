// AdminForms.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Écran Admin pour afficher les formulaires envoyés
 */
export default function AdminForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des formulaires
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("http://localhost:5005/forms");
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  if (loading) return <p>Chargement des formulaires…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📋 Formulaires collectés</h1>

      {/* Bouton retour */}
      <button onClick={() => navigate("/admin")}>← Retour au tableau de bord</button>

      {forms.length === 0 ? (
        <p>Aucun formulaire enregistré.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: "15px" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bénévole</th>
              <th>Adresse</th>
              <th>Quartier</th>
              <th>Inscrit listes</th>
              <th>Intention vote</th>
              <th>Suivi souhaité</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td>{form.date_visite}</td>
                <td>{form.nom_benevole}</td>
                <td>{form.adresse}</td>
                <td>{form.quartier}</td>
                <td>{form.inscrit_listes}</td>
                <td>{form.intention_vote}</td>
                <td>
                  {Array.isArray(form.souhait_suivi) ? form.souhait_suivi.join(", ") : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
