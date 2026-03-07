// AdminDashboard.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ── Palette ──────────────────────────────────────────────────
// Dégradé : vert foncé #1a6b2e → vert moyen #2d8a4e → bleu-vert #1a7a6b → bleu foncé #1a3a6b
const C = {
  g1: "#1a6b2e",   // vert foncé
  g2: "#2d8a4e",   // vert moyen
  g3: "#1a7a6b",   // bleu-vert
  g4: "#1a3a6b",   // bleu foncé
  light: "#f0f7f4",// fond très clair
  text: "#111111", // texte noir
  muted: "#555555",// texte secondaire
  border: "#d9e8e0",
  white: "#ffffff",
};

const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;

// ── Interfaces ───────────────────────────────────────────────
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

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient }: { label: string; value: number | string; icon: string; gradient: string }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: "12px",
      padding: "20px",
      display: "flex", flexDirection: "column", gap: "6px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      borderTop: `4px solid transparent`,
      borderImage: `${gradient} 1`,
      flex: 1, minWidth: "140px",
    }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{ fontSize: "26px", fontWeight: "800", color: C.text }}>{value}</span>
      <span style={{ fontSize: "11px", color: C.muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

// ── Bar Chart ────────────────────────────────────────────────
function BarChart({ data, title }: { data: Record<string, number>; title: string }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, val], i) => {
          const pct = (i / 7);
          const barColor = `hsl(${140 - pct * 110}, ${60 - pct * 10}%, ${30 + pct * 15}%)`;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: C.muted, width: "110px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key || "—"}</span>
              <div style={{ flex: 1, background: C.light, borderRadius: "4px", height: "20px", overflow: "hidden" }}>
                <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: barColor, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#fff", fontWeight: "700" }}>{val}</span>
                </div>
              </div>
            </div>
          );
        })}
        {Object.keys(data).length === 0 && <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune donnée</p>}
      </div>
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────
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
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/admin/forms/templates`);
      if (!res.ok) throw new Error("Erreur templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err: any) { console.error(err); }
  };

  useEffect(() => { fetchResponses(); fetchTemplates(); }, []);

  const handleArchive = async (id: string | number, archived: boolean) => {
    try {
      const res = await fetch(`${API}/api/admin/forms/responses/${id}/archive`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Erreur archivage");
      setResponses(prev => prev.map(r => r.id === id ? { ...r, archived } : r));
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Supprimer définitivement cette réponse ?")) return;
    try {
      await fetch(`${API}/api/forms/${id}`, { method: "DELETE" });
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch { alert("Erreur suppression"); }
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
    const matchA = filterArchived === "all" || (filterArchived === "active" && !r.archived) || (filterArchived === "archived" && r.archived);
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
    padding: "9px 22px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
    cursor: "pointer", border: "none",
    background: active ? C.g1 : C.white,
    color: active ? C.white : C.text,
    boxShadow: active ? "0 2px 8px rgba(26,107,46,0.3)" : "none",
    transition: "all 0.2s",
  });

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", border: `1px solid ${C.border}`,
    borderRadius: "8px", fontSize: "13px", color: C.text, background: C.white,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif", color: C.text }}>

      {/* ── Header ── */}
      <div style={{ background: GRADIENT, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "46px", filter: "brightness(0) invert(1)" }} />
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "500" }}>
            Dashboard Administrateur
          </span>
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
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: C.white, padding: "6px", borderRadius: "12px", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <button style={tabStyle(activeTab === "stats")} onClick={() => setActiveTab("stats")}>📊 Statistiques</button>
          <button style={tabStyle(activeTab === "responses")} onClick={() => { setActiveTab("responses"); setFilterArchived("active"); }}>
            📋 Actives ({stats.active.length})
          </button>
          <button style={tabStyle(activeTab === "archive")} onClick={() => { setActiveTab("archive"); setFilterArchived("archived"); }}>
            🗂️ Archives ({stats.archived.length})
          </button>
        </div>

        {/* ── STATS ── */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <StatCard label="Total visites" value={responses.length} icon="📊" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g2})`} />
              <StatCard label="Actives" value={stats.active.length} icon="✅" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g3})`} />
              <StatCard label="Archivées" value={stats.archived.length} icon="🗂️" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g4})`} />
              <StatCard label="Vote Oui" value={stats.oui.length} icon="🗳️" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g4})`} />
              <StatCard label="Inscrits" value={stats.inscrits.length} icon="📝" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g4})`} />
              <StatCard label="Dons" value={stats.dons.length} icon="💛" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g1})`} />
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
            <div style={{ background: C.white, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", border: `1px solid ${C.border}`, display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text" placeholder="🔍 Rechercher..." value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
              />
              <select value={filterQuartier} onChange={e => { setFilterQuartier(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                {quartiers.map(q => <option key={q}>{q}</option>)}
              </select>
              <select value={filterIntention} onChange={e => { setFilterIntention(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                {intentions.map(i => <option key={i}>{i}</option>)}
              </select>
              <select value={filterArchived} onChange={e => { setFilterArchived(e.target.value as any); setCurrentPage(1); }} style={inputStyle}>
                <option value="active">Actives</option>
                <option value="archived">Archivées</option>
                <option value="all">Toutes</option>
              </select>
              <span style={{ fontSize: "13px", color: C.muted }}>{filtered.length} résultat(s)</span>
              <button onClick={exportCSV} style={{ padding: "8px 14px", background: C.g1, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                ⬇️ CSV
              </button>
            </div>

            {loading && <p style={{ textAlign: "center", color: C.muted }}>Chargement...</p>}
            {error && <p style={{ color: "#c00" }}>{error}</p>}

            {!loading && !error && (
              <div style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: GRADIENT }}>
                      {["ID", "Date", "Bénévole", "Quartier", "Intention", "Inscrit", "Don", "Statut", "Actions"].map(h => (
                        <th key={h} style={{ padding: "11px 13px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "white" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>Aucune réponse trouvée</td></tr>
                    )}
                    {paginated.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? C.white : C.light, borderBottom: `1px solid ${C.border}` }}>
                        <td style={tdS}><span style={{ fontWeight: "700", color: C.muted }}>#{r.id}</span></td>
                        <td style={tdS}>{r.date_visite ?? "—"}</td>
                        <td style={{ ...tdS, fontWeight: "600", color: C.text }}>{r.nom_benevole ?? "—"}</td>
                        <td style={tdS}>
                          {r.quartier
                            ? <span style={{ background: "#e8f5ee", color: C.g1, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>{r.quartier}</span>
                            : "—"}
                        </td>
                        <td style={tdS}>
                          <span style={{
                            padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600",
                            background: r.intention_vote === "Oui" ? "#e8f5ee" : r.intention_vote === "Non" ? "#fdecea" : "#fef9e7",
                            color: r.intention_vote === "Oui" ? C.g1 : r.intention_vote === "Non" ? "#b71c1c" : "#7d5a00",
                          }}>{r.intention_vote ?? "—"}</span>
                        </td>
                        <td style={tdS}>{r.inscrit_listes ?? "—"}</td>
                        <td style={tdS}>{r.souhait_don ? "💛" : "—"}</td>
                        <td style={tdS}>
                          <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: r.archived ? "#eee" : "#e8f5ee", color: r.archived ? C.muted : C.g1 }}>
                            {r.archived ? "Archivée" : "Active"}
                          </span>
                        </td>
                        <td style={tdS}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            {/* Voir */}
                            <button onClick={() => setSelectedResponse(r)} title="Voir" style={btn(C.g4)}>👁</button>
                            {/* Archiver / Désarchiver */}
                            <button onClick={() => handleArchive(r.id, !r.archived)} title={r.archived ? "Désarchiver" : "Archiver"} style={btn(C.g3)}>
                              {r.archived ? "↩" : "🗂"}
                            </button>
                            {/* Supprimer */}
                            <button onClick={() => handleDelete(r.id)} title="Supprimer" style={btn("#b71c1c")}>🗑</button>
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={btn(C.g3)}>←</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    style={btn(currentPage === i + 1 ? C.g1 : "#ddd", currentPage === i + 1 ? "white" : C.text)}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={btn(C.g3)}>→</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Voir Réponse ── */}
      {selectedResponse && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", width: "560px", maxWidth: "95vw", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ background: GRADIENT, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "16px", fontWeight: "700" }}>
                Réponse #{selectedResponse.id} — {selectedResponse.nom_benevole}
              </h2>
              <button onClick={() => setSelectedResponse(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                  <div key={label} style={{ background: C.light, borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontWeight: "600", color: C.text }}>{val ?? "—"}</div>
                  </div>
                ))}
              </div>
              {selectedResponse.interets && selectedResponse.interets.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "6px" }}>Intérêts</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {selectedResponse.interets.map((item: string) => (
                      <span key={item} style={{ background: "#e8f5ee", color: C.g1, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedResponse.themes_importants && selectedResponse.themes_importants.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "6px" }}>Thèmes importants</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {selectedResponse.themes_importants.map((t: string) => (
                      <span key={t} style={{ background: "#e8eef5", color: C.g4, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setSelectedResponse(null)} style={{ width: "100%", padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Templates ── */}
      {showTemplateModal && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: "800", color: C.text }}>📋 Templates Formulaires</h2>
            {templates.map(t => (
              <div key={t.id} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600", color: C.text }}>{t.title}</span>
                <button onClick={() => { setSelectedTemplate(t); setShowTemplateModal(false); }} style={btn(C.g1)}>✏️ Modifier</button>
              </div>
            ))}
            <button onClick={() => setShowTemplateModal(false)} style={{ marginTop: "10px", padding: "10px", background: C.g4, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "600" }}>Fermer</button>
          </div>
        </div>
      )}

      {/* ── Modal Edit Template ── */}
      {selectedTemplate && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: "800", color: C.text }}>✏️ Modifier {selectedTemplate.title}</h2>
            <label style={{ fontSize: "12px", color: C.muted }}>Titre</label>
            <input
              value={selectedTemplate.title}
              onChange={e => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
              style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginBottom: "16px", fontSize: "14px", boxSizing: "border-box", color: C.text }}
            />
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: C.text }}>Questions</h3>
            {selectedTemplate.questions.map((q, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={q}
                  onChange={e => { const nq = [...selectedTemplate.questions]; nq[idx] = e.target.value; setSelectedTemplate({ ...selectedTemplate, questions: nq }); }}
                  style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", color: C.text }}
                />
                <button onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: selectedTemplate.questions.filter((_, i) => i !== idx) })} style={btn("#b71c1c")}>🗑</button>
              </div>
            ))}
            <button
              onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: [...selectedTemplate.questions, ""] })}
              style={{ ...btn(C.g4), marginBottom: "16px" }}>
              + Question
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  fetch(`${API}/api/admin/forms/templates/${selectedTemplate.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selectedTemplate),
                  }).then(() => { fetchTemplates(); setSelectedTemplate(null); });
                }}
                style={{ flex: 1, padding: "10px", background: C.g1, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                ✅ Sauvegarder
              </button>
              <button onClick={() => setSelectedTemplate(null)}
                style={{ flex: 1, padding: "10px", background: C.g4, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
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
const tdS: React.CSSProperties = { padding: "10px 13px", color: "#111", verticalAlign: "middle" };
const backdrop: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" };
const btn = (bg: string, color = "#fff"): React.CSSProperties => ({ padding: "5px 10px", background: bg, color, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" });
