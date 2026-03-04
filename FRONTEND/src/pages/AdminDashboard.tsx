// AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// -------------------- Interfaces --------------------

// Une réponse envoyée par un utilisateur
interface FormResponse {
  id: string | number;
  formTemplateId?: string | number; // Lien avec le template
  nom_benevole: string;
  quartier: string;
  email?: string;
  intention_vote?: string;
  archived?: boolean;
  [key: string]: any; // Pour les champs dynamiques
}

// Un template de formulaire modifiable par l'admin
interface FormTemplate {
  id: string | number;
  title: string;
  rib?: string;
  isActive: boolean;
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

// Pagination
const PAGE_SIZE = 10;

// -------------------- Composant principal --------------------
export default function AdminDashboard() {
  const navigate = useNavigate();

  // -------- États principaux --------
  const [responses, setResponses] = useState<FormResponse[]>([]); // Toutes les réponses
  const [templates, setTemplates] = useState<FormTemplate[]>([]); // Tous les templates
  const [loading, setLoading] = useState(true); // Pour l'état chargement
  const [error, setError] = useState<string | null>(null); // Pour erreurs fetch
  const [search, setSearch] = useState(""); // Filtre recherche
  const [currentPage, setCurrentPage] = useState(1); // Pagination

  // -------- Modal réponses et templates --------
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  //const [showResponseModal, setShowResponseModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // -------- Fetch des réponses --------
  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5005/admin/forms/responses");
      if (!res.ok) throw new Error("Erreur serveur lors du fetch des réponses");
      const data = await res.json();
      setResponses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // -------- Fetch des templates --------
  const fetchTemplates = async () => {
    try {
      const res = await fetch("http://localhost:5005/admin/forms/templates");
      if (!res.ok) throw new Error("Erreur serveur templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    }
  };

  // -------- Chargement initial --------
  useEffect(() => {
    fetchResponses();
    fetchTemplates();
  }, []);

  // -------- Archivage / désarchivage d'une réponse --------
  const handleArchive = async (id: string | number, archived: boolean) => {
    try {
      const res = await fetch(
        `http://localhost:5005/admin/forms/responses/${id}/archive`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived }),
        }
      );
      if (!res.ok) throw new Error("Erreur archivage");

      // Mise à jour locale du state
      setResponses((prev) =>
        prev.map((r) => (r.id === id ? { ...r, archived } : r))
      );
    } catch (err: any) {
      alert(err.message || "Erreur inconnue");
    }
  };

  // -------- Filtrage + Pagination --------
  const filteredResponses = responses.filter(
    (r) =>
      r.nom_benevole.toLowerCase().includes(search.toLowerCase()) ||
      r.quartier.toLowerCase().includes(search.toLowerCase()) ||
      (r.intention_vote?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const totalPages = Math.ceil(filteredResponses.length / PAGE_SIZE);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // -------- Render --------
  return (
    <div className="p-4 font-sans max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Navigation */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          ← Retour
        </button>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Gérer Formulaires
        </button>
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher par nom, quartier, intention"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />

      {/* Tableau des réponses */}
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Nom</th>
                <th className="border p-2">Quartier</th>
                <th className="border p-2">Intention</th>
                <th className="border p-2">Statut</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResponses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-2">
                    Aucune réponse trouvée
                  </td>
                </tr>
              )}
              {paginatedResponses.map((r) => (
                <tr key={r.id} className={r.archived ? "bg-gray-200" : ""}>
                  <td className="border p-2">{r.nom_benevole}</td>
                  <td className="border p-2">{r.quartier}</td>
                  <td className="border p-2">{r.intention_vote ?? "-"}</td>
                  <td className="border p-2">{r.archived ? "Archivée" : "Active"}</td>
                  <td className="border p-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedResponse(r)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => handleArchive(r.id, !r.archived)}
                      className={`px-2 py-1 rounded text-white ${
                        r.archived
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {r.archived ? "Désarchiver" : "Archiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal Response */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 w-full max-w-lg rounded">
            <h2 className="text-lg font-bold mb-2">
              {selectedResponse.nom_benevole} - Détails
            </h2>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(selectedResponse, null, 2)}
            </pre>
            <button
              onClick={() => setSelectedResponse(null)}
              className="mt-2 px-3 py-1 bg-gray-400 rounded text-white hover:bg-gray-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Templates */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 w-full max-w-lg rounded overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-2">Templates Formulaires</h2>
            <ul>
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="border p-2 mb-2 rounded flex justify-between items-center flex-wrap"
                >
                  <span>{t.title}</span>
                  <button
                    onClick={() => setSelectedTemplate(t)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Modifier
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowTemplateModal(false)}
              className="mt-2 px-3 py-1 bg-gray-400 rounded text-white hover:bg-gray-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Edit Template */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 w-full max-w-lg rounded max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">Modifier {selectedTemplate.title}</h2>

            {/* Modifier le titre */}
            <label className="block mb-1 font-semibold">Titre :</label>
            <input
              type="text"
              value={selectedTemplate.title}
              onChange={(e) =>
                setSelectedTemplate({ ...selectedTemplate, title: e.target.value })
              }
              className="border p-2 w-full rounded mb-4"
            />

            {/* Liste des questions */}
            <h3 className="font-semibold mb-2">Questions :</h3>
            <ul className="mb-4 space-y-2">
              {selectedTemplate.questions.map((q, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const newQuestions = [...selectedTemplate.questions];
                      newQuestions[idx] = e.target.value;
                      setSelectedTemplate({ ...selectedTemplate, questions: newQuestions });
                    }}
                    className="border p-2 flex-1 rounded"
                  />
                  <button
                    onClick={() => {
                      const newQuestions = selectedTemplate.questions.filter((_, i) => i !== idx);
                      setSelectedTemplate({ ...selectedTemplate, questions: newQuestions });
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>

            {/* Ajouter une question */}
            <button
              onClick={() =>
                setSelectedTemplate({
                  ...selectedTemplate,
                  questions: [...selectedTemplate.questions, ""],
                })
              }
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            >
              + Ajouter une question
            </button>

            {/* Sauvegarder / Annuler */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetch(
                    `http://localhost:5005/admin/forms/templates/${selectedTemplate.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(selectedTemplate),
                    }
                  ).then(() => {
                    fetchTemplates();
                    setSelectedTemplate(null);
                  });
                }}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-3 py-1 bg-gray-400 rounded text-white hover:bg-gray-500"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
