import React, { useEffect, useState } from "react";
import axios from "axios";
import EditResponseModal from "./Admin/EditResponseModal.tsx";

export interface QuizFormData {
  id: string; // ajouter un id pour chaque réponse
  nom_benevole: string;
  quartier: string;
  email: string;
  intention_vote: string;
  [key: string]: any; // permet d’éviter TS sur les autres champs
}

export default function ResponsesTable() {
  // ---------------------------
  // États principaux
  // ---------------------------
  const [responses, setResponses] = useState<QuizFormData[]>([]);
  const [filtered, setFiltered] = useState<QuizFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Barre de recherche et filtres
  // ---------------------------
  const [search, setSearch] = useState("");
  const [filterQuartier, setFilterQuartier] = useState("Tous");
  const [filterIntention, setFilterIntention] = useState("Toutes");

  // ---------------------------
  // Modal d'édition
  // ---------------------------
  const [selected, setSelected] = useState<QuizFormData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---------------------------
  // Récupérer toutes les réponses
  // ---------------------------
  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/forms");
      const data: QuizFormData[] = res.data.data || [];
      setResponses(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des réponses.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Ouvrir modal d'édition
  // ---------------------------
  const handleEditClick = (row: QuizFormData) => {
    setSelected(row);
    setIsModalOpen(true);
  };

  // ---------------------------
  // Sauvegarder l'édition
  // ---------------------------
  const handleSave = async (updatedData: QuizFormData) => {
    try {
      await axios.put(`http://localhost:3000/api/forms/${updatedData.id}`, updatedData);
      fetchResponses(); // Recharger les réponses après update
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    }
  };

  // ---------------------------
  // Supprimer une réponse
  // ---------------------------
  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette réponse ?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/forms/${id}`);
      const updated = responses.filter((r) => r.id !== id);
      setResponses(updated);
      setFiltered(updated);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // ---------------------------
  // Filtrage / recherche
  // ---------------------------
  useEffect(() => {
    let data = [...responses];

    if (search) {
      const lower = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.nom_benevole?.toLowerCase().includes(lower) ||
          r.quartier?.toLowerCase().includes(lower) ||
          r.email?.toLowerCase().includes(lower)
      );
    }

    if (filterQuartier !== "Tous") data = data.filter((r) => r.quartier === filterQuartier);
    if (filterIntention !== "Toutes") data = data.filter((r) => r.intention_vote === filterIntention);

    setFiltered(data);
  }, [search, filterQuartier, filterIntention, responses]);

  useEffect(() => {
    fetchResponses();
  }, []);

  const quartiers = ["Tous", ...Array.from(new Set(responses.map((r) => r.quartier).filter(Boolean)))];
  const intentions = ["Toutes", ...Array.from(new Set(responses.map((r) => r.intention_vote).filter(Boolean)))];

  if (loading) return <p>Chargement des réponses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="responses-table" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Admin Dashboard - Tableau des réponses</h2>

      {/* Barre de recherche */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Rechercher par nom, quartier ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1", padding: "5px" }}
        />
        <select value={filterQuartier} onChange={(e) => setFilterQuartier(e.target.value)}>
          {quartiers.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
        <select value={filterIntention} onChange={(e) => setFilterIntention(e.target.value)}>
          {intentions.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={thTdStyle}>ID</th>
            <th style={thTdStyle}>Nom bénévole</th>
            <th style={thTdStyle}>Quartier</th>
            <th style={thTdStyle}>Email</th>
            <th style={thTdStyle}>Intention de vote</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "10px" }}>Aucune réponse trouvée.</td>
            </tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.id}>
                <td style={thTdStyle}>{r.id}</td>
                <td style={thTdStyle}>{r.nom_benevole}</td>
                <td style={thTdStyle}>{r.quartier}</td>
                <td style={thTdStyle}>{r.email}</td>
                <td style={thTdStyle}>{r.intention_vote}</td>
                <td style={thTdStyle}>
                  <button
                    style={btnEditStyle}
                    onClick={() => handleEditClick(r)}
                  >Éditer</button>
                  <button
                    style={btnDeleteStyle}
                    onClick={() => handleDelete(r.id)}
                  >Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <EditResponseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selected}
        onSave={handleSave}
      />
    </div>
  );
}

// ---------------------------
// Styles simples
// ---------------------------
const thTdStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "8px" };
const btnEditStyle: React.CSSProperties = { marginRight: "5px", background: "#4CAF50", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" };
const btnDeleteStyle: React.CSSProperties = { background: "#f44336", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" };
