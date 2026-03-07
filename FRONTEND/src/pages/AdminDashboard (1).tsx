// AdminDashboard.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// -------------------- Interfaces --------------------
interface FormResponse {
  id: string | number;
  nom_benevole?: string;
  quartier?: string;
  email?: string;
  intention_vote?: string;
  archived?: boolean;
  date_visite?: string;
  inscrit_listes?: string;
  souhait_don?: boolean;
  contact_accord?: boolean;
  interets?: string[];
  themes_importants?: string[];
  adresse?: string;
  [key: string]: any;
}

interface FormTemplate {
  id: string | number;
  title: string;
  rib?: string;
  isActive: boolean;
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;
const API = "http://localhost:3000";

// -------------------- Stat Card --------------------
function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div style={{
      background: "#fff", border: `2px solid ${color}`, borderRadius: "12px",
      padding: "20px", display: "flex", flexDirection: "column", gap: "6px",
      boxShadow: `0 2px 12px ${color}22`, minWidth: "140px", flex: 1,
    }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <span style={{ fontSize: "28px", fontWeight: "800", color }}>{value}</span>
      <span style={{ fontSize: "12px", color: "#888", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

// -------------------- Bar Chart --------------------
function BarChart({ data, title }: { data: Record<string, number>; title: string }) {
  const max = Math.max(...Object.values(data), 1);
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#be185d"];
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" }}>
      <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, val], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", width: "120px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key || "—"}</span>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "4px", height: "22px", overflow: "hidden" }}>
              <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: colors[i % colors.length], borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px" }}>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: "700" }}>{val}</span>
              </div>
            </div>
          </div>
        ))}
        {Object.keys(data).length === 0 && <p style={{ color: "#9ca3af", fontSize: "13px" }}>Aucune donnée</p>}
      </div>
    </div>
  );
}

// -------------------- Composant principal --------------------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "responses" | "archive">("stats");
  const [filterQuartier, setFilterQuartier] = useState("Tous");
  const [filterIntention, setFilterIntention] = useState("Toutes");
  const [filterArchived, setFilterArchived] = useState<"all" | "active" | "archived">("active");

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/forms/responses`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setResponses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/admin/forms/templates`);
      if (!res.ok) throw new Error("Erreur templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => { fetchResponses(); fetchTemplates(); }, []);

  const handleArchive = async (id: string | number, archived: boolean) => {
    try {
      const res = await fetch(`${API}/api/admin/forms/responses/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Erreur archivage");
      setResponses(prev => prev.map(r => r.id === id ? { ...r, archived } : r));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Supprimer définitivement ?")) return;
    try {
      await fetch(`${API}/api/forms/${id}`, { method: "DELETE" });
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("Erreur suppression");
    }
  };

  const stats = useMemo(() => {
    const active = responses.filter(r => !r.archived);
    const archived = responses.filter(r => r.archived);
    const oui = responses.filter(r => r.intention_vote === "Oui");
    const dons = responses.filter(r => r.souhait_don);
    const inscrits = responses.filter(r => r.inscrit_listes === "Oui");
    const parQuartier: Record<string, number> = {};
    const parIntention: Record<string, number> = {};
    const parInscrit: Record<string, number> = {};
    const parBenevole: Record<string, number> = {};
    responses.forEach(r => {
      if (r.quartier) parQuartier[r.quartier] = (parQuartier[r.quartier] || 0) + 1;
      if (r.intention_vote) parIntention[r.intention_vote] = (parIntention[r.intention_vote] || 0) + 1;
      if (r.inscrit_listes) parInscrit[r.inscrit_listes] = (parInscrit[r.inscrit_listes] || 0) + 1;
      if (r.nom_benevole) parBenevole[r.nom_benevole] = (parBenevole[r.nom_benevole] || 0) + 1;
    });
    return { active, archived, oui, dons, inscrits, parQuartier, parIntention, parInscrit, parBenevole };
  }, [responses]);

  const quartiers = ["Tous", ...Array.from(new Set(responses.map(r => r.quartier).filter(Boolean) as string[]))];
  const intentions = ["Toutes", ...Array.from(new Set(responses.map(r => r.intention_vote).filter(Boolean) as string[]))];

  const filtered = useMemo(() => responses.filter(r => {
    const s = search.toLowerCase();
    const matchSearch =
      (r.nom_benevole?.toLowerCase() ?? "").includes(s) ||
      (r.quartier?.toLowerCase() ?? "").includes(s) ||
      (r.intention_vote?.toLowerCase() ?? "").includes(s) ||
      (r.email?.toLowerCase() ?? "").includes(s);
    const matchQ = filterQuartier === "Tous" || r.quartier === filterQuartier;
    const matchI = filterIntention === "Toutes" || r.intention_vote === filterIntention;
    const matchA =
      filterArchived === "all" ||
      (filterArchived === "active" && !r.archived) ||
      (filterArchived === "archived" && r.archived);
    return matchSearch && matchQ && matchI && matchA;
  }), [responses, search, filterQuartier, filterIntention, filterArchived]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["ID", "Date", "Bénévole", "Adresse", "Quartier", "Email", "Intention vote", "Inscrit listes", "Souhait don", "Archivé"];
    const rows = filtered.map(r => [
      r.id, r.date_visite ?? "", r.nom_benevole ?? "", r.adresse ?? "",
      r.quartier ?? "", r.email ?? "", r.intention_vote ?? "",
      r.inscrit_listes ?? "", r.souhait_don ? "Oui" : "Non", r.archived ? "Oui" : "Non",
    ]);
    const csv = [headers, ...rows].map(row => row.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citizen13-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
    cursor: "pointer", border: "none",
    background: active ? "#1a6b2e" : "#f3f4f6",
    color: active ? "#fff" : "#374151",
    transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "#1a6b2e", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "48px", filter: "brightness(0) invert(1)" }} />
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Dashboard Administrateur
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={exportCSV} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
            ⬇️ Export CSV
          </button>
          <button onClick={() => setShowTemplateModal(true)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            📋 Templates
          </button>
          <button onClick={() => navigate("/")} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            ← Retour
          </button>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ padding: "24px 32px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button style={tabStyle(activeTab === "stats")} onClick={() => setActiveTab("stats")}>📊 Statistiques</button>
          <button style={tabStyle(activeTab === "responses")} onClick={() => { setActiveTab("responses"); setFilterArchived("active"); }}>
            📋 Réponses actives ({stats.active.length})
          </button>
          <button style={tabStyle(activeTab === "archive")} onClick={() => { setActiveTab("archive"); setFilterArchived("archived"); }}>
            🗂️ Archives ({stats.archived.length})
          </button>
        </div>

        {/* ── STATS ── */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <StatCard label="Total visites" value={responses.length} color="#2563eb" icon="📊" />
              <StatCard label="Actives" value={stats.active.length} color="#16a34a" icon="✅" />
              <StatCard label="Archivées" value={stats.archived.length} color="#6b7280" icon="🗂️" />
              <StatCard label="Vote Oui" value={stats.oui.length} color="#7c3aed" icon="🗳️" />
              <StatCard label="Inscrits listes" value={stats.inscrits.length} color="#0891b2" icon="📝" />
              <StatCard label="Souhait don" value={stats.dons.length} color="#d97706" icon="💛" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <BarChart data={stats.parQuartier} title="Visites par quartier" />
              <BarChart data={stats.parIntention} title="Intention de vote" />
              <BarChart data={stats.parInscrit} title="Inscription listes" />
              <BarChart data={stats.parBenevole} title="Visites par bénévole" />
            </div>
          </div>
        )}

        {/* ── RESPONSES / ARCHIVE ── */}
        {(activeTab === "responses" || activeTab === "archive") && (
          <div>
            {/* Filtres */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #e5e7eb", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ flex: 1, minWidth: "180px", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" }}
              />
              <select value={filterQuartier} onChange={e => { setFilterQuartier(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                {quartiers.map(q => <option key={q}>{q}</option>)}
              </select>
              <select value={filterIntention} onChange={e => { setFilterIntention(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                {intentions.map(i => <option key={i}>{i}</option>)}
              </select>
              <select value={filterArchived} onChange={e => { setFilterArchived(e.target.value as any); setCurrentPage(1); }} style={selectStyle}>
                <option value="active">Actives</option>
                <option value="archived">Archivées</option>
                <option value="all">Toutes</option>
              </select>
              <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>{filtered.length} résultat(s)</span>
              <button onClick={exportCSV} style={{ padding: "8px 12px", background: "#1a6b2e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                ⬇️ CSV
              </button>
            </div>

            {loading && <p style={{ textAlign: "center", color: "#6b7280" }}>Chargement...</p>}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {!loading && !error && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#1a6b2e" }}>
                      {["ID", "Date", "Bénévole", "Quartier", "Intention", "Inscrit", "Don", "Statut", "Actions"].map(h => (
                        <th key={h} style={{ ...th, color: "white" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>Aucune réponse trouvée</td></tr>
                    )}
                    {paginated.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        <td style={td}><span style={{ fontWeight: "700", color: "#6b7280" }}>#{r.id}</span></td>
                        <td style={td}>{r.date_visite ?? "—"}</td>
                        <td style={{ ...td, fontWeight: "600" }}>{r.nom_benevole ?? "—"}</td>
                        <td style={td}>
                          {r.quartier
                            ? <span style={{ background: "#f0fdf4", color: "#1a6b2e", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>{r.quartier}</span>
                            : "—"}
                        </td>
                        <td style={td}>
                          <span style={{
                            background: r.intention_vote === "Oui" ? "#dcfce7" : r.intention_vote === "Non" ? "#fee2e2" : "#fef9c3",
                            color: r.intention_vote === "Oui" ? "#16a34a" : r.intention_vote === "Non" ? "#dc2626" : "#92400e",
                            padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600",
                          }}>{r.intention_vote ?? "—"}</span>
                        </td>
                        <td style={td}>{r.inscrit_listes ?? "—"}</td>
                        <td style={td}>{r.souhait_don ? "💛" : "—"}</td>
                        <td style={td}>
                          <span style={{ background: r.archived ? "#f3f4f6" : "#dcfce7", color: r.archived ? "#6b7280" : "#16a34a", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                            {r.archived ? "Archivée" : "Active"}
                          </span>
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            <button onClick={() => setSelectedResponse(r)} style={btnSmall("#2563eb")}>👁</button>
                            <button onClick={() => handleArchive(r.id, !r.archived)} style={btnSmall(r.archived ? "#d97706" : "#6b7280")}>
                              {r.archived ? "↩" : "🗂"}
                            </button>
                            <button onClick={() => handleDelete(r.id)} style={btnSmall("#dc2626")}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px", flexWrap: "wrap" }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={btnSmall("#475569")} disabled={currentPage === 1}>←</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    style={btnSmall(currentPage === i + 1 ? "#1a6b2e" : "#e5e7eb", currentPage === i + 1 ? "#fff" : "#374151")}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={btnSmall("#475569")} disabled={currentPage === totalPages}>→</button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Modal Voir Réponse ── */}
      {selectedResponse && (
        <div style={backdrop}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "560px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "800" }}>
              📋 Réponse #{selectedResponse.id} — {selectedResponse.nom_benevole}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
              {([
                ["Date", selectedResponse.date_visite],
                ["Quartier", selectedResponse.quartier],
                ["Adresse", selectedResponse.adresse],
                ["Email", selectedResponse.email],
                ["Intention vote", selectedResponse.intention_vote],
                ["Inscrit listes", selectedResponse.inscrit_listes],
                ["Souhait don", selectedResponse.souhait_don ? "Oui" : "Non"],
                ["Contact accord", selectedResponse.contact_accord ? "Oui" : "Non"],
              ] as [string, string | undefined][]).map(([label, val]) => (
                <div key={label} style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px", textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{val ?? "—"}</div>
                </div>
              ))}
            </div>
            {selectedResponse.interets && selectedResponse.interets.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px", textTransform: "uppercase" }}>Intérêts</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {selectedResponse.interets.map((item: string) => (
                    <span key={item} style={{ background: "#f0fdf4", color: "#1a6b2e", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>{item}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedResponse.themes_importants && selectedResponse.themes_importants.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px", textTransform: "uppercase" }}>Thèmes importants</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {selectedResponse.themes_importants.map((t: string) => (
                    <span key={t} style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setSelectedResponse(null)} style={{ marginTop: "20px", padding: "10px 20px", background: "#1a6b2e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "600" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Templates ── */}
      {showTemplateModal && (
        <div style={backdrop}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "800" }}>📋 Templates Formulaires</h2>
            {templates.map(t => (
              <div key={t.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600" }}>{t.title}</span>
                <button onClick={() => { setSelectedTemplate(t); setShowTemplateModal(false); }} style={btnSmall("#1a6b2e")}>✏️ Modifier</button>
              </div>
            ))}
            <button onClick={() => setShowTemplateModal(false)} style={{ marginTop: "10px", padding: "10px", background: "#475569", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "600" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Edit Template ── */}
      {selectedTemplate && (
        <div style={backdrop}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "800" }}>✏️ Modifier {selectedTemplate.title}</h2>
            <label style={{ fontSize: "12px", color: "#6b7280" }}>Titre</label>
            <input
              value={selectedTemplate.title}
              onChange={e => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
              style={{ display: "block", width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", boxSizing: "border-box" }}
            />
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>Questions</h3>
            {selectedTemplate.questions.map((q, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={q}
                  onChange={e => {
                    const nq = [...selectedTemplate.questions];
                    nq[idx] = e.target.value;
                    setSelectedTemplate({ ...selectedTemplate, questions: nq });
                  }}
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" }}
                />
                <button
                  onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: selectedTemplate.questions.filter((_, i) => i !== idx) })}
                  style={btnSmall("#dc2626")}>🗑</button>
              </div>
            ))}
            <button
              onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: [...selectedTemplate.questions, ""] })}
              style={{ ...btnSmall("#2563eb"), marginBottom: "16px" }}>
              + Question
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  fetch(`${API}/api/admin/forms/templates/${selectedTemplate.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selectedTemplate),
                  }).then(() => { fetchTemplates(); setSelectedTemplate(null); });
                }}
                style={{ flex: 1, padding: "10px", background: "#1a6b2e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                ✅ Sauvegarder
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{ flex: 1, padding: "10px", background: "#475569", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Styles utilitaires ──
const th: React.CSSProperties = {
  padding: "10px 12px", textAlign: "left", fontSize: "12px",
  fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px",
};
const td: React.CSSProperties = { padding: "10px 12px", color: "#374151", verticalAlign: "middle" };
const backdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px",
};
const selectStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" };
const btnSmall = (bg: string, color = "#fff"): React.CSSProperties => ({
  padding: "5px 10px", background: bg, color, border: "none",
  borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap",
});
