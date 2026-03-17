"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

const C = {
  g1: "#1a6b2e", g2: "#2d8a4e", g3: "#1a7a6b", g4: "#1a3a6b",
  light: "#f0f7f4", text: "#111111", muted: "#555555", border: "#d9e8e0", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const PAGE_SIZE = 10;
const API = "";

interface FormResponse {
  id: string | number;
  nom_benevole?: string; quartier?: string; email?: string;
  intention_vote?: string; archived?: boolean; date_visite?: string;
  inscrit_listes?: string; souhait_don?: boolean; contact_accord?: boolean;
  interets?: string[]; themes_importants?: string[]; adresse?: string;
  [key: string]: any;
}
interface FormTemplate {
  id: string | number; title: string; rib?: string;
  isActive: boolean; questions: string[]; createdAt: string; updatedAt: string;
}
interface Agent {
  id: number; nom: string; prenom?: string; email?: string;
  telephone?: string; role: string; zone?: string; actif: boolean;
  created_at: string;
}
interface Don {
  id: number; agent_id?: number; montant?: number; statut: string;
  type: string; nom?: string; email?: string; notes?: string;
  created_at: string; agent?: Agent;
}
interface Boitage {
  id: number; nom_benevole?: string; date: string; quartier: string;
  adresse?: string; nb_tracts: number; nb_boites: number; commentaire?: string;
  created_at: string; agent?: Agent;
}
interface Tractage {
  id: number; nom_benevole?: string; date: string; quartier: string;
  adresse?: string; nb_tracts: number; nb_portes: number; commentaire?: string;
  created_at: string; agent?: Agent;
}
interface Reunion {
  id: number; titre: string; date: string; lieu?: string;
  ordre_du_jour?: string; participants?: string; transcription?: string;
  rapport?: string; agent_nom?: string; created_at: string;
}
interface Evenement {
  id: number; titre: string; date: string; heure?: string;
  adresse?: string; sujets?: string; photo_url?: string; created_at: string;
}

const STATUT_COLORS: Record<string, { bg: string; color: string }> = {
  en_attente: { bg: "#fef9e7", color: "#7d5a00" },
  recu: { bg: "#e8f5ee", color: "#1a6b2e" },
  annule: { bg: "#fdecea", color: "#b71c1c" },
};

function StatCard({ label, value, icon, gradient }: { label: string; value: number | string; icon: string; gradient: string }) {
  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderTop: "4px solid transparent", borderImage: `${gradient} 1`, flex: 1, minWidth: "140px" }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{ fontSize: "26px", fontWeight: "800", color: C.text }}>{value}</span>
      <span style={{ fontSize: "11px", color: C.muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

function BarChart({ data, title, color }: { data: Record<string, number>; title: string; color?: string }) {
  const max = Math.max(...Object.values(data), 1);
  const baseColor = color || C.g1;
  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, val], i) => {
          const opacity = 1 - (i / 9) * 0.5;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: C.muted, width: "110px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key || "—"}</span>
              <div style={{ flex: 1, background: C.light, borderRadius: "4px", height: "22px", overflow: "hidden" }}>
                <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: baseColor, opacity, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px", transition: "width 0.6s ease" }}>
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

// Graphique en anneau (donut)
function DonutChart({ data, title, colors }: { data: Record<string, number>; title: string; colors?: string[] }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const defaultColors = [C.g1, C.g3, C.g4, "#c97a00", "#8b3a8b", "#2c5282", "#c0392b", "#16a085"];
  const palette = colors || defaultColors;
  if (total === 0) return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{title}</h3>
      <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune donnée</p>
    </div>
  );

  let cumAngle = -90;
  const cx = 70, cy = 70, r = 52, inner = 30;
  const segments = Object.entries(data).map(([key, val], i) => {
    const angle = (val / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(cumAngle - 0.01));
    const y2 = cy + r * Math.sin(toRad(cumAngle - 0.01));
    const xi1 = cx + inner * Math.cos(toRad(startAngle));
    const yi1 = cy + inner * Math.sin(toRad(startAngle));
    const xi2 = cx + inner * Math.cos(toRad(cumAngle - 0.01));
    const yi2 = cy + inner * Math.sin(toRad(cumAngle - 0.01));
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
    return { key, val, path, color: palette[i % palette.length], pct: Math.round((val / total) * 100) };
  });

  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>{title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {segments.map(s => <path key={s.key} d={s.path} fill={s.color} />)}
          <text x="70" y="66" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.text}>{total}</text>
          <text x="70" y="80" textAnchor="middle" fontSize="9" fill={C.muted}>TOTAL</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1 }}>
          {segments.map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.key}</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: C.muted }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Graphique en courbe (évolution temporelle)
function LineChart({ data, title, color }: { data: { date: string; value: number }[]; title: string; color?: string }) {
  const lineColor = color || C.g1;
  if (data.length < 2) return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{title}</h3>
      <p style={{ color: "#aaa", fontSize: "13px", marginTop: "12px" }}>Pas assez de données</p>
    </div>
  );
  const W = 320, H = 120, PAD = { t: 16, r: 16, b: 28, l: 36 };
  const maxV = Math.max(...data.map(d => d.value), 1);
  const xStep = (W - PAD.l - PAD.r) / (data.length - 1);
  const yScale = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxV);
  const points = data.map((d, i) => `${PAD.l + i * xStep},${yScale(d.value)}`).join(" ");
  const area = `M ${PAD.l},${H - PAD.b} ` + data.map((d, i) => `L ${PAD.l + i * xStep},${yScale(d.value)}`).join(" ") + ` L ${PAD.l + (data.length - 1) * xStep},${H - PAD.b} Z`;

  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>{title}</h3>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {/* Grille */}
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + (H - PAD.t - PAD.b) * t} y2={PAD.t + (H - PAD.t - PAD.b) * t} stroke={C.border} strokeWidth="1" />
        ))}
        {/* Aire */}
        <path d={area} fill={lineColor} fillOpacity="0.12" />
        {/* Ligne */}
        <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Points */}
        {data.map((d, i) => (
          <circle key={i} cx={PAD.l + i * xStep} cy={yScale(d.value)} r="4" fill={lineColor} stroke="white" strokeWidth="2" />
        ))}
        {/* Labels x */}
        {data.filter((_, i) => data.length <= 8 || i % Math.ceil(data.length / 8) === 0).map((d, i, arr) => {
          const origI = data.indexOf(d);
          return <text key={i} x={PAD.l + origI * xStep} y={H - 4} textAnchor="middle" fontSize="8" fill={C.muted}>{d.date.slice(5)}</text>;
        })}
        {/* Labels y */}
        {[0, maxV].map((v, i) => (
          <text key={i} x={PAD.l - 4} y={i === 0 ? H - PAD.b + 4 : PAD.t + 4} textAnchor="end" fontSize="8" fill={C.muted}>{v}</text>
        ))}
      </svg>
    </div>
  );
}

// Graphique barres groupées (bénévoles : visites + boitage + tractage)
function GroupedBarChart({ data, title }: { data: { label: string; visites: number; boitage: number; tractage: number }[]; title: string }) {
  const maxV = Math.max(...data.flatMap(d => [d.visites, d.boitage, d.tractage]), 1);
  const W = 360, H = 140, PAD = { t: 16, r: 16, b: 40, l: 36 };
  const groupW = (W - PAD.l - PAD.r) / Math.max(data.length, 1);
  const barW = Math.min(groupW * 0.22, 18);
  const barColors = [C.g1, "#1a3a6b", "#c97a00"];
  const yScale = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxV);

  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>{title}</h3>
      <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
        {["Visites", "Boîtage", "Tractage"].map((l, i) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: barColors[i] }} />
            <span style={{ fontSize: "11px", color: C.muted }}>{l}</span>
          </div>
        ))}
      </div>
      {data.length === 0 ? <p style={{ color: "#aaa", fontSize: "13px" }}>Aucune donnée</p> : (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {[0, 0.5, 1].map(t => (
            <line key={t} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + (H - PAD.t - PAD.b) * t} y2={PAD.t + (H - PAD.t - PAD.b) * t} stroke={C.border} strokeWidth="1" />
          ))}
          {data.slice(0, 10).map((d, i) => {
            const gx = PAD.l + i * groupW + groupW / 2;
            return (
              <g key={d.label}>
                {[d.visites, d.boitage, d.tractage].map((v, j) => (
                  <rect key={j} x={gx + (j - 1) * (barW + 2) - barW / 2} y={yScale(v)} width={barW} height={Math.max(H - PAD.b - yScale(v), 0)} fill={barColors[j]} rx="2" />
                ))}
                <text x={gx} y={H - 4} textAnchor="middle" fontSize="8" fill={C.muted} style={{ overflow: "hidden" }}>
                  {d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ── Wrapper graphique avec menu export/archivage ──
interface ChartCardAction {
  label: string;
  icon: string;
  onClick: () => void;
}

interface ChartCardWrapperProps {
  id: string;
  title: string;
  csvData?: () => string;
  csvFilename?: string;
  children: React.ReactNode;
}

function ChartCardWrapper({ id, title, csvData, csvFilename, children }: ChartCardWrapperProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [archived, setArchived] = useState(false);

  const exportPNG = async () => {
    const el = document.getElementById(id);
    if (!el) return;
    // Sérialise le SVG ou capture le div en canvas via méthode native
    const svgs = el.querySelectorAll("svg");
    if (svgs.length > 0) {
      const svg = svgs[0];
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const bbox = svg.getBoundingClientRect();
      canvas.width = bbox.width || 400;
      canvas.height = bbox.height || 300;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const link = document.createElement("a");
        link.download = `${csvFilename ?? id}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = url;
    } else {
      alert("Export PNG disponible uniquement pour les graphiques SVG.");
    }
    setMenuOpen(false);
  };

  const exportCSV = () => {
    if (!csvData) return;
    const csv = csvData();
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${csvFilename ?? id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleArchive = () => {
    setArchived(true);
    setMenuOpen(false);
  };

  const handleRestore = () => {
    setArchived(false);
  };

  if (archived) {
    return (
      <div style={{ background: C.white, borderRadius: "12px", padding: "16px 20px", border: `1px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: C.muted, fontStyle: "italic" }}>🗂️ Graphique archivé : <strong style={{ color: C.text }}>{title}</strong></span>
        <button onClick={handleRestore} style={{ padding: "5px 12px", background: C.g3, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>↩️ Restaurer</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }} id={id}>
      {/* Bouton menu */}
      <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          title="Options"
          style={{ width: "28px", height: "28px", borderRadius: "6px", border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: C.muted, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", lineHeight: 1 }}
        >⋮</button>
        {menuOpen && (
          <>
            {/* Overlay cliquable pour fermer */}
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
            <div style={{ position: "absolute", right: 0, top: "32px", background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", boxShadow: "0 6px 24px rgba(0,0,0,0.13)", zIndex: 20, minWidth: "170px", overflow: "hidden" }}>
              <button onClick={exportPNG} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: C.text, textAlign: "left" }}>
                <span>🖼️</span> Exporter PNG
              </button>
              {csvData && (
                <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: C.text, textAlign: "left", borderTop: `1px solid ${C.border}` }}>
                  <span>📊</span> Exporter CSV
                </button>
              )}
              <button onClick={handleArchive} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#c97a00", textAlign: "left", borderTop: `1px solid ${C.border}` }}>
                <span>🗂️</span> Archiver
              </button>
            </div>
          </>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [boitages, setBoitages] = useState<Boitage[]>([]);
  const [tractages, setTractages] = useState<Tractage[]>([]);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [showEvenementModal, setShowEvenementModal] = useState(false);
  const [editingEvenement, setEditingEvenement] = useState<Partial<Evenement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "responses" | "archive" | "agents" | "dons" | "evenements">("stats");
  const [filterQuartier, setFilterQuartier] = useState("Tous");
  const [filterIntention, setFilterIntention] = useState("Toutes");
  const [filterArchived, setFilterArchived] = useState<"all" | "active" | "archived">("active");
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);

  // Agent modal
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Partial<Agent> | null>(null);
  const [agentPassword, setAgentPassword] = useState("");

  // Don modal
  const [showDonModal, setShowDonModal] = useState(false);
  const [editingDon, setEditingDon] = useState<Partial<Don> | null>(null);

  // Invitation mail
  const [invitingAgent, setInvitingAgent] = useState<number | null>(null);

  // Sélection multiple pour archivage
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(r => r.id)));
    }
  };

  const handleBulkArchive = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`${API}/api/admin/forms/responses/${id}/archive`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: true }),
          })
        )
      );
      setResponses(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, archived: true } : r));
      setSelectedIds(new Set());
      setShowArchiveConfirm(false);
    } catch {
      alert("Erreur lors de l'archivage groupé");
    }
  };

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
    try { const res = await fetch(`${API}/api/admin/forms/templates`); const data = await res.json(); setTemplates(Array.isArray(data) ? data : []); } catch {}
  };
  const fetchAgents = async () => {
    try { const res = await fetch(`${API}/api/agents`); const data = await res.json(); setAgents(Array.isArray(data) ? data : []); } catch {}
  };
  const fetchDons = async () => {
    try { const res = await fetch(`${API}/api/dons`); const data = await res.json(); setDons(Array.isArray(data) ? data : []); } catch {}
  };
  const fetchTerrain = async () => {
    try {
      const [b, t, r] = await Promise.all([
        fetch(`${API}/api/boitage`).then(r => r.json()),
        fetch(`${API}/api/tractage`).then(r => r.json()),
        fetch(`${API}/api/reunions`).then(r => r.json()),
      ]);
      setBoitages(Array.isArray(b) ? b : []);
      setTractages(Array.isArray(t) ? t : []);
      setReunions(Array.isArray(r) ? r : []);
    } catch {}
  };
  const fetchEvenements = async () => {
    try { const res = await fetch(`${API}/api/evenements`); const data = await res.json(); setEvenements(Array.isArray(data) ? data : []); } catch {}
  };

  useEffect(() => { fetchResponses(); fetchTemplates(); fetchAgents(); fetchDons(); fetchTerrain(); fetchEvenements(); }, []);

  const handleArchive = async (id: string | number, archived: boolean) => {
    try {
      const res = await fetch(`${API}/api/admin/forms/responses/${id}/archive`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
      if (!res.ok) throw new Error("Erreur archivage");
      setResponses(prev => prev.map(r => r.id === id ? { ...r, archived } : r));
    } catch (err: any) { alert(err.message); }
  };
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Supprimer définitivement ?")) return;
    try { await fetch(`${API}/api/forms/${id}`, { method: "DELETE" }); setResponses(prev => prev.filter(r => r.id !== id)); } catch { alert("Erreur suppression"); }
  };

  const handleSaveAgent = async () => {
    if (!editingAgent?.nom) { alert("Le nom est obligatoire."); return; }
    try {
      const payload: any = { ...editingAgent };
      if (agentPassword) payload.password = agentPassword;
      if (editingAgent.id) {
        await fetch(`${API}/api/agents/${editingAgent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`${API}/api/agents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      fetchAgents(); setShowAgentModal(false); setEditingAgent(null); setAgentPassword("");
    } catch { alert("Erreur sauvegarde agent"); }
  };
  const handleDeleteAgent = async (id: number) => {
    if (!window.confirm("Supprimer cet agent ?")) return;
    try { await fetch(`${API}/api/agents/${id}`, { method: "DELETE" }); setAgents(prev => prev.filter(a => a.id !== id)); } catch { alert("Erreur suppression agent"); }
  };
  const handleToggleAgent = async (agent: Agent) => {
    try {
      await fetch(`${API}/api/agents/${agent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actif: !agent.actif }) });
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, actif: !a.actif } : a));
    } catch { alert("Erreur mise à jour"); }
  };
  const handleInviteAgent = async (agent: Agent) => {
  if (!agent.email) { alert("Cet agent n'a pas d'email renseigné."); return; }
  if (!window.confirm(`Envoyer le lien d'accès à ${agent.email} ?`)) return;
  setInvitingAgent(agent.id);
  try {
    // 1. Met à jour le mot de passe en DB
    await fetch(`/api/agents/${agent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "admin000" }),
    });
    // 2. Envoie l'email
    const res = await fetch(`/api/agents/invite`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: agent.email, nom: agent.nom, prenom: agent.prenom, password: "admin000" }),
    });
    const data = await res.json();
    if (data.success) alert(`✅ Invitation envoyée à ${agent.email}`);
    else alert("❌ Erreur lors de l'envoi du mail");
  } catch { alert("Erreur réseau"); }
  finally { setInvitingAgent(null); }
};

  const handleSaveDon = async () => {
    if (!editingDon) return;
    try {
      const payload = { ...editingDon };
      if (editingDon.id) {
        await fetch(`${API}/api/dons/${editingDon.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`${API}/api/dons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      fetchDons(); setShowDonModal(false); setEditingDon(null);
    } catch { alert("Erreur sauvegarde don"); }
  };
  const handleDeleteDon = async (id: number) => {
    if (!window.confirm("Supprimer ce don ?")) return;
    try { await fetch(`${API}/api/dons/${id}`, { method: "DELETE" }); setDons(prev => prev.filter(d => d.id !== id)); } catch { alert("Erreur suppression don"); }
  };
  const handleStatutDon = async (don: Don, statut: string) => {
    try {
      await fetch(`${API}/api/dons/${don.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }) });
      setDons(prev => prev.map(d => d.id === don.id ? { ...d, statut } : d));
    } catch { alert("Erreur mise à jour statut"); }
  };

  const handleSaveEvenement = async () => {
    if (!editingEvenement?.titre) { alert("Le titre est obligatoire."); return; }
    try {
      const payload = { ...editingEvenement };
      if (editingEvenement.id) {
        await fetch(`${API}/api/evenements/${editingEvenement.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`${API}/api/evenements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      fetchEvenements(); setShowEvenementModal(false); setEditingEvenement(null);
    } catch { alert("Erreur sauvegarde événement"); }
  };
  const handleDeleteEvenement = async (id: number) => {
    if (!window.confirm("Supprimer cet événement ?")) return;
    try { await fetch(`${API}/api/evenements/${id}`, { method: "DELETE" }); setEvenements(prev => prev.filter(e => e.id !== id)); } catch { alert("Erreur suppression événement"); }
  };
  const handleUploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData(); fd.append("photo", file);
      const res = await fetch(`${API}/api/evenements/upload`, { method: "POST", body: fd });
      const data = await res.json();
      return data.url ?? null;
    } catch { return null; }
  };

  const donStats = useMemo(() => {
    const recus = dons.filter(d => d.statut === "recu");
    const total = recus.reduce((acc, d) => acc + (d.montant ?? 0), 0);
    const moyenne = recus.length > 0 ? total / recus.length : 0;
    return { total, moyenne, nb: dons.length, recus: recus.length, attente: dons.filter(d => d.statut === "en_attente").length };
  }, [dons]);

  const terrainStats = useMemo(() => {
    const totalBoites = boitages.reduce((acc, b) => acc + b.nb_boites, 0);
    const totalTractsB = boitages.reduce((acc, b) => acc + b.nb_tracts, 0);
    const totalTractsT = tractages.reduce((acc, b) => acc + b.nb_tracts, 0);
    const totalPortes = tractages.reduce((acc, t) => acc + t.nb_portes, 0);
    const parQuartierB: Record<string, number> = {};
    const parQuartierT: Record<string, number> = {};
    boitages.forEach(b => { parQuartierB[b.quartier] = (parQuartierB[b.quartier] || 0) + b.nb_boites; });
    tractages.forEach(t => { parQuartierT[t.quartier] = (parQuartierT[t.quartier] || 0) + t.nb_tracts; });
    return { totalBoites, totalTractsB, totalTractsT, totalPortes, parQuartierB, parQuartierT };
  }, [boitages, tractages]);

  const stats = useMemo(() => {
    const active = responses.filter(r => !r.archived);
    const archived = responses.filter(r => r.archived);
    const oui = responses.filter(r => r.intention_vote === "Oui");
    const donsForm = responses.filter(r => r.souhait_don);
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
    return { active, archived, oui, dons: donsForm, inscrits, parQuartier, parIntention, parInscrit, parBenevole };
  }, [responses]);

  const quartiers = ["Tous", ...Array.from(new Set(responses.map(r => r.quartier).filter(Boolean) as string[]))];
  const intentions = ["Toutes", ...Array.from(new Set(responses.map(r => r.intention_vote).filter(Boolean) as string[]))];

  // Données graphiques enrichies
  const chartData = useMemo(() => {
    // Évolution visites par mois
    const visitesParMois: Record<string, number> = {};
    responses.forEach(r => {
      if (r.date_visite) {
        const m = r.date_visite.slice(0, 7); // YYYY-MM
        visitesParMois[m] = (visitesParMois[m] || 0) + 1;
      }
    });
    const visitesLine = Object.entries(visitesParMois).sort().map(([date, value]) => ({ date, value }));

    // Évolution dons par mois
    const donsParMois: Record<string, number> = {};
    dons.forEach(d => {
      const m = d.created_at?.slice(0, 7);
      if (m) donsParMois[m] = (donsParMois[m] || 0) + (d.montant ?? 0);
    });
    const donsLine = Object.entries(donsParMois).sort().map(([date, value]) => ({ date, value: Math.round(value) }));

    // Participation bénévoles (visites + boitage + tractage)
    const benevoleMap: Record<string, { visites: number; boitage: number; tractage: number }> = {};
    responses.forEach(r => {
      const b = r.nom_benevole || "Inconnu";
      if (!benevoleMap[b]) benevoleMap[b] = { visites: 0, boitage: 0, tractage: 0 };
      benevoleMap[b].visites++;
    });
    boitages.forEach(b => {
      const name = b.nom_benevole || "Inconnu";
      if (!benevoleMap[name]) benevoleMap[name] = { visites: 0, boitage: 0, tractage: 0 };
      benevoleMap[name].boitage++;
    });
    tractages.forEach(t => {
      const name = t.nom_benevole || "Inconnu";
      if (!benevoleMap[name]) benevoleMap[name] = { visites: 0, boitage: 0, tractage: 0 };
      benevoleMap[name].tractage++;
    });
    const benevoleData = Object.entries(benevoleMap)
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => (b.visites + b.boitage + b.tractage) - (a.visites + a.boitage + a.tractage));

    // Données questionnaires
    const interetsMap: Record<string, number> = {};
    const themesMap: Record<string, number> = {};
    const soutienMap: Record<string, number> = {};
    responses.forEach(r => {
      (r.interets ?? []).forEach((i: string) => { interetsMap[i] = (interetsMap[i] || 0) + 1; });
      (r.themes_importants ?? []).forEach((t: string) => { themesMap[t] = (themesMap[t] || 0) + 1; });
      if (r.soutien_assoc) soutienMap[r.soutien_assoc] = (soutienMap[r.soutien_assoc] || 0) + 1;
    });

    // Statut dons donut
    const donsStatut: Record<string, number> = { "Reçus": 0, "En attente": 0, "Annulés": 0 };
    dons.forEach(d => {
      if (d.statut === "recu") donsStatut["Reçus"]++;
      else if (d.statut === "en_attente") donsStatut["En attente"]++;
      else if (d.statut === "annule") donsStatut["Annulés"]++;
    });

    return { visitesLine, donsLine, benevoleData, interetsMap, themesMap, soutienMap, donsStatut };
  }, [responses, dons, boitages, tractages]);
  
  const filtered = useMemo(() => responses.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = (r.nom_benevole?.toLowerCase() ?? "").includes(s) || (r.quartier?.toLowerCase() ?? "").includes(s) || (r.intention_vote?.toLowerCase() ?? "").includes(s) || (r.email?.toLowerCase() ?? "").includes(s);
    const matchQ = filterQuartier === "Tous" || r.quartier === filterQuartier;
    const matchI = filterIntention === "Toutes" || r.intention_vote === filterIntention;
    const matchA = filterArchived === "all" || (filterArchived === "active" && !r.archived) || (filterArchived === "archived" && r.archived);
    return matchSearch && matchQ && matchI && matchA;
  }), [responses, search, filterQuartier, filterIntention, filterArchived]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["ID", "Date", "Bénévole", "Adresse", "Quartier", "Email", "Intention vote", "Inscrit listes", "Souhait don", "Archivé"];
    const rows = filtered.map(r => [r.id, r.date_visite ?? "", r.nom_benevole ?? "", r.adresse ?? "", r.quartier ?? "", r.email ?? "", r.intention_vote ?? "", r.inscrit_listes ?? "", r.souhait_don ? "Oui" : "Non", r.archived ? "Oui" : "Non"]);
    const csv = [headers, ...rows].map(row => row.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
    a.download = `citizen13-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 22px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
    cursor: "pointer", border: "none",
    background: active ? C.g1 : C.white, color: active ? C.white : C.text,
    boxShadow: active ? "0 2px 8px rgba(26,107,46,0.3)" : "none", transition: "all 0.2s",
  });
  const inputStyle: React.CSSProperties = { padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "12px", color: C.text, background: C.white };
  const roleColors: Record<string, string> = { admin: C.g1, superviseur: C.g4, benevole: C.g3 };


     {/* RETURN G */}
  return (
    <ProtectedRoute roles={["admin", "superviseur"]}>
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ background: GRADIENT, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "80px", borderRadius: "4px", cursor: "pointer" }}onClick={() => router.back()}  />
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "500" }}>Dashboard Administrateur</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={() => window.open("/visit", "_blank")} style={hBtn}> + Nouvelle visite</button>
          <button onClick={exportCSV} style={hBtn}>⬇️ Export CSV</button>
          <button onClick={() => setShowTemplateModal(true)} style={hBtn}>📋 Templates</button>
          <button onClick={() => router.push("/map")} style={hBtn}>🗺 Carte</button>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("user"); window.location.href = "/login"; }} style={hBtn}>🚪 Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* ── STATS ── */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* LIGNE HAUTE : Tabs gauche + Analyses visites droite */}
            <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>

              {/* Gauche : barre de tabs verticale */}
              <div style={{ width: "43%", flexShrink: 0, display: "flex", flexDirection: "column" }}>
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: C.white, padding: "6px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1 }}>
    <button style={tabStyle((activeTab as string) === "stats")} onClick={() => setActiveTab("stats")}>📊 Statistiques</button>
    <button style={tabStyle((activeTab as string) === "responses")} onClick={() => { setActiveTab("responses"); setFilterArchived("active"); }}>📋 Actives ({stats.active.length})</button>
    <button style={tabStyle((activeTab as string) === "archive")} onClick={() => { setActiveTab("archive"); setFilterArchived("archived"); }}>🗂️ Archives ({stats.archived.length})</button>
    <button style={tabStyle((activeTab as string) === "agents")} onClick={() => setActiveTab("agents")}>👥 Agents ({agents.length})</button>
    <button style={tabStyle((activeTab as string) === "dons")} onClick={() => setActiveTab("dons")}>💛 Dons ({dons.length})</button>
    <button style={tabStyle((activeTab as string) === "evenements")} onClick={() => setActiveTab("evenements")}>📅 Événements ({evenements.length})</button>
  </div>
</div>

              {/* Droite : Analyses visites */}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📊 Analyses visites</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <ChartCardWrapper id="chart-visites-quartier" title="Visites par quartier" csvFilename="visites-par-quartier" csvData={() => ["Quartier,Visites", ...Object.entries(stats.parQuartier).map(([k, v]) => `${k},${v}`)].join("\n")}>
                    <BarChart data={stats.parQuartier} title="Visites par quartier" color={C.g1} />
                  </ChartCardWrapper>
                  <ChartCardWrapper id="chart-intention-vote" title="Intention de vote" csvFilename="intention-vote" csvData={() => ["Intention,Nombre", ...Object.entries(stats.parIntention).map(([k, v]) => `${k},${v}`)].join("\n")}>
                    <DonutChart data={stats.parIntention} title="Intention de vote" colors={[C.g1, "#b71c1c", "#c97a00", C.g3]} />
                  </ChartCardWrapper>
                  <ChartCardWrapper id="chart-inscription" title="Inscription listes" csvFilename="inscription-listes" csvData={() => ["Statut,Nombre", ...Object.entries(stats.parInscrit).map(([k, v]) => `${k},${v}`)].join("\n")}>
                    <BarChart data={stats.parInscrit} title="Inscription listes" color={C.g3} />
                  </ChartCardWrapper>
                  <ChartCardWrapper id="chart-souhait-don" title="Souhait de don" csvFilename="souhait-don" csvData={() => `Catégorie,Nombre\nSouhait don,${stats.dons.length}\nSans don,${stats.active.length - stats.dons.length}`}>
                    <DonutChart data={{ "Souhait don": stats.dons.length, "Sans don": stats.active.length - stats.dons.length }} title="Souhait de don" colors={["#c9a800", C.border]} />
                  </ChartCardWrapper>
                </div>
              </div>
            </div>

            {/* ── GRAPHIQUES ÉVOLUTION ── */}
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📈 Évolution dans le temps</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartCardWrapper id="chart-visites-mois" title="Visites par mois" csvFilename="visites-par-mois" csvData={() => ["Mois,Visites", ...chartData.visitesLine.map(d => `${d.date},${d.value}`)].join("\n")}>
                  <LineChart data={chartData.visitesLine} title="Visites par mois" color={C.g1} />
                </ChartCardWrapper>
                <ChartCardWrapper id="chart-dons-mois" title="Dons par mois" csvFilename="dons-par-mois" csvData={() => ["Mois,Montant (€)", ...chartData.donsLine.map(d => `${d.date},${d.value}`)].join("\n")}>
                  <LineChart data={chartData.donsLine} title="Dons collectés par mois (€)" color="#c9a800" />
                </ChartCardWrapper>
              </div>
            </div>

            {/* ── PARTICIPATION BÉNÉVOLES ── */}
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>👥 Participation des bénévoles</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartCardWrapper id="chart-activites-benevole" title="Activités par bénévole" csvFilename="activites-benevoles" csvData={() => ["Bénévole,Visites,Boîtage,Tractage", ...chartData.benevoleData.map(d => `${d.label},${d.visites},${d.boitage},${d.tractage}`)].join("\n")}>
                  <GroupedBarChart data={chartData.benevoleData} title="Activités par bénévole" />
                </ChartCardWrapper>
                <ChartCardWrapper id="chart-visites-benevole" title="Visites par bénévole" csvFilename="visites-benevoles" csvData={() => ["Bénévole,Visites", ...Object.entries(stats.parBenevole).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <BarChart data={stats.parBenevole} title="Visites par bénévole" color={C.g2} />
                </ChartCardWrapper>
              </div>
            </div>

            {/* ── DONNÉES QUESTIONNAIRES ── */}
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📋 Données questionnaires</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <ChartCardWrapper id="chart-interets" title="Centres d'intérêt" csvFilename="centres-interet" csvData={() => ["Intérêt,Nombre", ...Object.entries(chartData.interetsMap).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <BarChart data={chartData.interetsMap} title="Centres d'intérêt" color={C.g3} />
                </ChartCardWrapper>
                <ChartCardWrapper id="chart-themes" title="Thèmes importants" csvFilename="themes-importants" csvData={() => ["Thème,Nombre", ...Object.entries(chartData.themesMap).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <BarChart data={chartData.themesMap} title="Thèmes importants" color={C.g4} />
                </ChartCardWrapper>
                <ChartCardWrapper id="chart-soutien" title="Soutien association" csvFilename="soutien-association" csvData={() => ["Soutien,Nombre", ...Object.entries(chartData.soutienMap).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <DonutChart data={chartData.soutienMap} title="Soutien association" />
                </ChartCardWrapper>
              </div>
            </div>

            {/* ── DONS ── */}
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>💛 Dons</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartCardWrapper id="chart-statut-dons" title="Statut des dons" csvFilename="statut-dons" csvData={() => ["Statut,Nombre", ...Object.entries(chartData.donsStatut).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <DonutChart data={chartData.donsStatut} title="Statut des dons" colors={[C.g1, "#c97a00", "#b71c1c"]} />
                </ChartCardWrapper>
                <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Résumé financier</h3>
                  {[
                    { label: "Total collecté", value: `${donStats.total.toFixed(2)} €`, color: C.g1 },
                    { label: "Nombre de dons", value: donStats.nb, color: C.g3 },
                    { label: "Dons reçus", value: donStats.recus, color: C.g2 },
                    { label: "En attente", value: donStats.attente, color: "#c97a00" },
                    { label: "Montant moyen", value: `${donStats.moyenne.toFixed(2)} €`, color: C.g4 },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.light, borderRadius: "8px" }}>
                      <span style={{ fontSize: "13px", color: C.muted }}>{item.label}</span>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABLEAU RÉUNIONS — pleine largeur */}
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>🤝 Réunions</h2>
              <div style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead><tr style={{ background: GRADIENT }}>{["Date", "Titre", "Lieu", "Agent", "Transcription", "Rapport", "Action"].map(h => <th key={h} style={{ padding: "10px 13px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "white" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {reunions.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>Aucune réunion enregistrée</td></tr>}
                    {reunions.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? C.white : C.light, borderBottom: `1px solid ${C.border}` }}>
                        <td style={tdS}>{r.date}</td>
                        <td style={{ ...tdS, fontWeight: "600" }}>{r.titre}</td>
                        <td style={tdS}>{r.lieu ?? "—"}</td>
                        <td style={tdS}>{r.agent_nom ?? "—"}</td>
                        <td style={tdS}>{r.transcription ? <span style={{ background: "#e8f5ee", color: C.g1, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>✅ Oui</span> : <span style={{ color: "#aaa", fontSize: "12px" }}>—</span>}</td>
                        <td style={tdS}>{r.rapport ? <span style={{ background: "#e8eef5", color: C.g4, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>✅ Oui</span> : <span style={{ color: "#aaa", fontSize: "12px" }}>—</span>}</td>
                        <td style={tdS}><button onClick={() => setSelectedReunion(r)} style={btn(C.g3)}>👁 Voir</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GRILLE 2x2 : Visites | Réunions / Boitage | Tractage */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Visites — haut gauche */}
              <div>
                <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📋 Visites</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <StatCard label="Total" value={responses.length} icon="📊" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g2})`} />
                  <StatCard label="Actives" value={stats.active.length} icon="✅" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g3})`} />
                  <StatCard label="Archivées" value={stats.archived.length} icon="🗂️" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g4})`} />
                  <StatCard label="Vote Oui" value={stats.oui.length} icon="🗳️" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g4})`} />
                  <StatCard label="Inscrits" value={stats.inscrits.length} icon="📝" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g4})`} />
                  <StatCard label="Dons" value={stats.dons.length} icon="💛" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g1})`} />
                </div>
              </div>

              {/* Réunions — haut droite */}
              <div>
                <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>🤝 Réunions</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <StatCard label="Total" value={reunions.length} icon="🤝" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g1})`} />
                  <StatCard label="Transcrites" value={reunions.filter(r => r.transcription).length} icon="🎙️" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g3})`} />
                  <StatCard label="Avec rapport" value={reunions.filter(r => r.rapport).length} icon="📝" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g4})`} />
                </div>
              </div>

              {/* Boîtage — bas gauche */}
              <div>
                <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📬 Boîtage</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <StatCard label="Sessions" value={boitages.length} icon="📬" gradient={`linear-gradient(90deg, ${C.g4}, #2c5282)`} />
                  <StatCard label="Boîtes" value={terrainStats.totalBoites} icon="🏠" gradient={`linear-gradient(90deg, #1a3a6b, #2c5282)`} />
                  <StatCard label="Tracts" value={terrainStats.totalTractsB} icon="📄" gradient={`linear-gradient(90deg, #2c5282, ${C.g4})`} />
                </div>
                <ChartCardWrapper id="chart-boitage-quartier" title="Boîtes par quartier" csvFilename="boitage-quartier" csvData={() => ["Quartier,Boîtes", ...Object.entries(terrainStats.parQuartierB).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <BarChart data={terrainStats.parQuartierB} title="Boîtes par quartier" />
                </ChartCardWrapper>
              </div>

              {/* Tractage — bas droite */}
              <div>
                <h2 style={{ fontSize: "13px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>📄 Tractage</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <StatCard label="Sessions" value={tractages.length} icon="📄" gradient={`linear-gradient(90deg, #7d4e00, #c97a00)`} />
                  <StatCard label="Portes" value={terrainStats.totalPortes} icon="🚪" gradient={`linear-gradient(90deg, #c97a00, #7d4e00)`} />
                  <StatCard label="Tracts" value={terrainStats.totalTractsT} icon="🗞️" gradient={`linear-gradient(90deg, #7d4e00, #c97a00)`} />
                </div>
                <ChartCardWrapper id="chart-tractage-quartier" title="Tracts par quartier" csvFilename="tractage-quartier" csvData={() => ["Quartier,Tracts", ...Object.entries(terrainStats.parQuartierT).map(([k, v]) => `${k},${v}`)].join("\n")}>
                  <BarChart data={terrainStats.parQuartierT} title="Tracts par quartier" />
                </ChartCardWrapper>
              </div>

            </div>

            {/* EVENEMENT */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={() => setActiveTab("evenements")} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "12px 48px", cursor: "pointer", color: C.text, fontWeight: "600", fontSize: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                EVENEMENT
              </button>
            </div>

            {/* CARTE INTERACTIVE */}
            <div onClick={() => router.push("/map")} style={{ cursor: "pointer", background: C.white, borderRadius: "12px", padding: "16px", border: `2px dashed ${C.g1}`, textAlign: "center", color: C.g1, fontWeight: "700", fontSize: "14px" }}>
              🗺 Voir la carte interactive des visites →
            </div>

          </div>
        )}

        {/* ── RESPONSES / ARCHIVE ── */}
        {(activeTab === "responses" || activeTab === "archive") && (
          <div>
          <button onClick={() => setActiveTab("stats")} style={{ background: "none", border: "none", color: C.g1, fontWeight: "700", fontSize: "13px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Statistiques</button>
            <div style={{ background: C.white, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", border: `1px solid ${C.border}`, display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, flex: 1, minWidth: "180px" }} />
              <select value={filterQuartier} onChange={e => { setFilterQuartier(e.target.value); setCurrentPage(1); }} style={inputStyle}>{quartiers.map(q => <option key={q}>{q}</option>)}</select>
              <select value={filterIntention} onChange={e => { setFilterIntention(e.target.value); setCurrentPage(1); }} style={inputStyle}>{intentions.map(i => <option key={i}>{i}</option>)}</select>
              <select value={filterArchived} onChange={e => { setFilterArchived(e.target.value as any); setCurrentPage(1); }} style={inputStyle}>
                <option value="active">Actives</option><option value="archived">Archivées</option><option value="all">Toutes</option>
              </select>
              <span style={{ fontSize: "13px", color: C.muted }}>{filtered.length} résultat(s)</span>
              {selectedIds.size > 0 && (
                <button onClick={() => setShowArchiveConfirm(true)} style={{ padding: "8px 14px", background: "#c97a00", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                  🗂 Archiver la sélection ({selectedIds.size})
                </button>
              )}
              <button onClick={exportCSV} style={{ padding: "8px 14px", background: C.g1, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>⬇️ CSV</button>
            </div>
            {loading && <p style={{ textAlign: "center", color: C.muted }}>Chargement...</p>}
            {error && <p style={{ color: "#c00" }}>{error}</p>}
            {!loading && !error && (
              <div style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead><tr style={{ background: GRADIENT }}>
                    <th style={{ padding: "11px 13px", textAlign: "left" }}>
                      <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleSelectAll} style={{ cursor: "pointer", width: "15px", height: "15px" }} />
                    </th>
                    {["ID", "Date", "Bénévole", "Quartier", "Intention", "Inscrit", "Don", "Statut", "Actions"].map(h => <th key={h} style={{ padding: "11px 13px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "white" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {paginated.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>Aucune réponse trouvée</td></tr>}
                    {paginated.map((r, i) => (
                      <tr key={r.id} style={{ background: selectedIds.has(r.id) ? "#fff9e6" : i % 2 === 0 ? C.white : C.light, borderBottom: `1px solid ${C.border}` }}>
                        <td style={tdS}>
                          <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} style={{ cursor: "pointer", width: "15px", height: "15px" }} />
                        </td>
                        <td style={tdS}><span style={{ fontWeight: "700", color: C.muted }}>#{r.id}</span></td>
                        <td style={tdS}>{r.date_visite ?? "—"}</td>
                        <td style={{ ...tdS, fontWeight: "600" }}>{r.nom_benevole ?? "—"}</td>
                        <td style={tdS}>{r.quartier ? <span style={{ background: "#e8f5ee", color: C.g1, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>{r.quartier}</span> : "—"}</td>
                        <td style={tdS}><span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: r.intention_vote === "Oui" ? "#e8f5ee" : r.intention_vote === "Non" ? "#fdecea" : "#fef9e7", color: r.intention_vote === "Oui" ? C.g1 : r.intention_vote === "Non" ? "#b71c1c" : "#7d5a00" }}>{r.intention_vote ?? "—"}</span></td>
                        <td style={tdS}>{r.inscrit_listes ?? "—"}</td>
                        <td style={tdS}>{r.souhait_don ? "💛" : "—"}</td>
                        <td style={tdS}><span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: r.archived ? "#eee" : "#e8f5ee", color: r.archived ? C.muted : C.g1 }}>{r.archived ? "Archivée" : "Active"}</span></td>
                        <td style={tdS}><div style={{ display: "flex", gap: "5px" }}><button onClick={() => setSelectedResponse(r)} style={btn(C.g4)}>👁</button><button onClick={() => handleArchive(r.id, !r.archived)} style={btn(C.g3)}>{r.archived ? "↩" : "🗂"}</button><button onClick={() => handleDelete(r.id)} style={btn("#b71c1c")}>🗑</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px", flexWrap: "wrap" }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={btn(C.g3)}>←</button>
                {Array.from({ length: totalPages }).map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} style={btn(currentPage === i + 1 ? C.g1 : "#ddd", currentPage === i + 1 ? "white" : C.text)}>{i + 1}</button>)}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={btn(C.g3)}>→</button>
              </div>
            )}
          </div>
        )}

        {/* ── AGENTS ── */}
        {activeTab === "agents" && (
          <div>
          <button onClick={() => setActiveTab("stats")} style={{ background: "none", border: "none", color: C.g1, fontWeight: "700", fontSize: "13px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Statistiques</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: C.text }}>👥 Gestion des agents</h2>
              <button onClick={() => { setEditingAgent({ role: "benevole", actif: true }); setAgentPassword(""); setShowAgentModal(true); }} style={{ padding: "10px 20px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>➕ Nouvel agent</button>
            </div>
            <div style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead><tr style={{ background: GRADIENT }}>{["ID", "Nom", "Email", "Téléphone", "Rôle", "Zone", "Statut", "Actions"].map(h => <th key={h} style={{ padding: "11px 13px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "white" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {agents.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>Aucun agent</td></tr>}
                  {agents.map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? C.white : C.light, borderBottom: `1px solid ${C.border}` }}>
                      <td style={tdS}><span style={{ fontWeight: "700", color: C.muted }}>#{a.id}</span></td>
                      <td style={{ ...tdS, fontWeight: "600" }}>{a.prenom ? `${a.prenom} ${a.nom}` : a.nom}</td>
                      <td style={tdS}>{a.email ?? "—"}</td>
                      <td style={tdS}>{a.telephone ?? "—"}</td>
                      <td style={tdS}><span style={{ background: `${roleColors[a.role] ?? C.g3}22`, color: roleColors[a.role] ?? C.g3, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" }}>{a.role}</span></td>
                      <td style={tdS}>{a.zone ?? "—"}</td>
                      <td style={tdS}><span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: a.actif ? "#e8f5ee" : "#eee", color: a.actif ? C.g1 : C.muted }}>{a.actif ? "Actif" : "Inactif"}</span></td>
                      <td style={tdS}><div style={{ display: "flex", gap: "5px" }}><button onClick={() => { setEditingAgent({ ...a }); setAgentPassword(""); setShowAgentModal(true); }} style={btn(C.g4)}>✏️</button><button onClick={() => handleToggleAgent(a)} style={btn(a.actif ? C.g3 : C.g2)}>{a.actif ? "⏸" : "▶️"}</button><button onClick={() => handleInviteAgent(a)} disabled={invitingAgent === a.id} style={btn("#e67e22")} title="Envoyer invitation par mail">{invitingAgent === a.id ? "⏳" : "📧"}</button><button onClick={() => handleDeleteAgent(a.id)} style={btn("#b71c1c")}>🗑</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DONS ── */}
        {activeTab === "dons" && (
          <div>
          <button onClick={() => setActiveTab("stats")} style={{ background: "none", border: "none", color: C.g1, fontWeight: "700", fontSize: "13px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Statistiques</button>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
              <StatCard label="Total collecté" value={`${donStats.total.toFixed(2)} €`} icon="💰" gradient={`linear-gradient(90deg, ${C.g1}, ${C.g2})`} />
              <StatCard label="Nb dons" value={donStats.nb} icon="💛" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g3})`} />
              <StatCard label="Dons reçus" value={donStats.recus} icon="✅" gradient={`linear-gradient(90deg, ${C.g3}, ${C.g4})`} />
              <StatCard label="En attente" value={donStats.attente} icon="⏳" gradient={`linear-gradient(90deg, ${C.g4}, ${C.g1})`} />
              <StatCard label="Moyenne" value={`${donStats.moyenne.toFixed(2)} €`} icon="📊" gradient={`linear-gradient(90deg, ${C.g2}, ${C.g1})`} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: C.text }}>💛 Gestion des dons</h2>
              <button onClick={() => { setEditingDon({ statut: "en_attente", type: "don" }); setShowDonModal(true); }} style={{ padding: "10px 20px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>➕ Nouveau don</button>
            </div>
            <div style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead><tr style={{ background: GRADIENT }}>{["ID", "Date", "Nom", "Email", "Montant", "Type", "Agent", "Statut", "Actions"].map(h => <th key={h} style={{ padding: "11px 13px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "white" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {dons.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>Aucun don enregistré</td></tr>}
                  {dons.map((d, i) => {
                    const sc = STATUT_COLORS[d.statut] ?? STATUT_COLORS.en_attente;
                    return (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? C.white : C.light, borderBottom: `1px solid ${C.border}` }}>
                        <td style={tdS}><span style={{ fontWeight: "700", color: C.muted }}>#{d.id}</span></td>
                        <td style={tdS}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                        <td style={{ ...tdS, fontWeight: "600" }}>{d.nom ?? "—"}</td>
                        <td style={tdS}>{d.email ?? "—"}</td>
                        <td style={tdS}><span style={{ fontWeight: "700", color: C.g1 }}>{d.montant != null ? `${d.montant} €` : "—"}</span></td>
                        <td style={tdS}><span style={{ background: "#e8eef5", color: C.g4, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>{d.type}</span></td>
                        <td style={tdS}>{d.agent ? `${d.agent.prenom ?? ""} ${d.agent.nom}`.trim() : "—"}</td>
                        <td style={tdS}>
                          <select value={d.statut} onChange={e => handleStatutDon(d, e.target.value)}
                            style={{ padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", border: `1px solid ${sc.bg}`, background: sc.bg, color: sc.color, cursor: "pointer" }}>
                            <option value="en_attente">⏳ En attente</option>
                            <option value="recu">✅ Reçu</option>
                            <option value="annule">❌ Annulé</option>
                          </select>
                        </td>
                        <td style={tdS}><div style={{ display: "flex", gap: "5px" }}><button onClick={() => { setEditingDon({ ...d }); setShowDonModal(true); }} style={btn(C.g4)}>✏️</button><button onClick={() => handleDeleteDon(d.id)} style={btn("#b71c1c")}>🗑</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ÉVÉNEMENTS ── */}
        {activeTab === "evenements" && (
          <div>
          <button onClick={() => setActiveTab("stats")} style={{ background: "none", border: "none", color: C.g1, fontWeight: "700", fontSize: "13px", cursor: "pointer", marginBottom: "16px", padding: 0 }}>← Statistiques</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: C.text }}>📅 Gestion des événements</h2>
              <button onClick={() => { setEditingEvenement({}); setShowEvenementModal(true); }} style={{ padding: "10px 20px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>➕ Nouvel événement</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {evenements.length === 0 && <div style={{ background: C.white, borderRadius: "12px", padding: "32px", textAlign: "center", color: "#aaa", border: `1px solid ${C.border}` }}>Aucun événement enregistré</div>}
{[...evenements].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (                <div key={e.id} style={{ background: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "center", padding: "16px" }}>
                  {e.photo_url
                    ? <img src={e.photo_url} alt={e.titre} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                    : <div style={{ width: "80px", height: "80px", background: C.light, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}>📅</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: C.text, marginBottom: "4px" }}>{e.titre}</div>
                    <div style={{ fontSize: "13px", color: C.g1, fontWeight: "600", marginBottom: "2px" }}>{e.date}{e.heure ? ` · ${e.heure}` : ""}</div>
                    {e.adresse && <div style={{ fontSize: "12px", color: C.muted }}>📍 {e.adresse}</div>}
                    {e.sujets && <div style={{ fontSize: "12px", color: C.muted, marginTop: "4px" }}>🗒 {e.sujets}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => { setEditingEvenement({ ...e }); setShowEvenementModal(true); }} style={btn(C.g4)}>✏️</button>
                    <button onClick={() => handleDeleteEvenement(e.id)} style={btn("#b71c1c")}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Événement */}
      {showEvenementModal && editingEvenement !== null && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "480px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: "800", color: C.text }}>{editingEvenement.id ? "✏️ Modifier l'événement" : "➕ Nouvel événement"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
       {([["Titre *", "titre", "text"], ["Date", "date", "date"], ["Heure", "heure", "time"], ["Adresse", "adresse", "text"]] as [string, keyof Evenement, string][]).map(([label, field, type]) => (
                <div key={field as string}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>{label}</label>
                  <input type={type} value={(editingEvenement as any)[field] ?? ""} onChange={e => setEditingEvenement({ ...editingEvenement, [field]: e.target.value })}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box" as const, color: C.text }} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Sujets</label>
                <textarea value={editingEvenement.sujets ?? ""} onChange={e => setEditingEvenement({ ...editingEvenement, sujets: e.target.value })} rows={3}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box" as const, color: C.text, resize: "vertical" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Photo</label>
                {editingEvenement.photo_url && (
                  <img src={editingEvenement.photo_url} alt="aperçu" style={{ display: "block", width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginTop: "6px", marginBottom: "6px" }} />
                )}
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await handleUploadPhoto(file);
                  if (url) setEditingEvenement({ ...editingEvenement, photo_url: url });
                }} style={{ display: "block", marginTop: "4px", fontSize: "13px" }} />
                {editingEvenement.photo_url && (
                  <button onClick={() => setEditingEvenement({ ...editingEvenement, photo_url: undefined })} style={{ ...btn("#b71c1c"), marginTop: "6px" }}>🗑 Supprimer la photo</button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={handleSaveEvenement} style={{ flex: 1, padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>✅ Sauvegarder</button>
              <button onClick={() => { setShowEvenementModal(false); setEditingEvenement(null); }} style={{ flex: 1, padding: "10px", background: C.g4, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir Réponse */}
      {selectedResponse && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", width: "560px", maxWidth: "95vw", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ background: GRADIENT, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "16px", fontWeight: "700" }}>Réponse #{selectedResponse.id} — {selectedResponse.nom_benevole}</h2>
              <button onClick={() => setSelectedResponse(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {([["Date", selectedResponse.date_visite], ["Quartier", selectedResponse.quartier], ["Adresse", selectedResponse.adresse], ["Email", selectedResponse.email], ["Intention vote", selectedResponse.intention_vote], ["Inscrit listes", selectedResponse.inscrit_listes], ["Souhait don", selectedResponse.souhait_don ? "Oui" : "Non"], ["Contact accord", selectedResponse.contact_accord ? "Oui" : "Non"]] as [string, string | undefined][]).map(([label, val]) => (
                  <div key={label} style={{ background: C.light, borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontWeight: "600", color: C.text }}>{val ?? "—"}</div>
                  </div>
                ))}
              </div>
              {(selectedResponse.interets ?? []).length > 0 && <div style={{ marginTop: "14px" }}><div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "6px" }}>Intérêts</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{(selectedResponse.interets ?? []).map((item: string) => <span key={item} style={{ background: "#e8f5ee", color: C.g1, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{item}</span>)}</div></div>}
              {(selectedResponse.themes_importants ?? []).length > 0 && <div style={{ marginTop: "14px" }}><div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "6px" }}>Thèmes importants</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{(selectedResponse.themes_importants ?? []).map((t: string) => <span key={t} style={{ background: "#e8eef5", color: C.g4, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{t}</span>)}</div></div>}
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setSelectedResponse(null)} style={{ width: "100%", padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir Réunion */}
      {selectedReunion && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", width: "620px", maxWidth: "95vw", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ background: GRADIENT, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "16px", fontWeight: "700" }}>🤝 {selectedReunion.titre}</h2>
              <button onClick={() => setSelectedReunion(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {([["Date", selectedReunion.date], ["Lieu", selectedReunion.lieu], ["Agent", selectedReunion.agent_nom], ["Participants", selectedReunion.participants]] as [string, string | undefined][]).map(([label, val]) => (
                  <div key={label} style={{ background: C.light, borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontWeight: "600", color: C.text }}>{val ?? "—"}</div>
                  </div>
                ))}
              </div>
              {selectedReunion.ordre_du_jour && (
                <div style={{ background: C.light, borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", marginBottom: "6px" }}>Ordre du jour</div>
                  <div style={{ fontSize: "13px", color: C.text, whiteSpace: "pre-wrap" }}>{selectedReunion.ordre_du_jour}</div>
                </div>
              )}
              {selectedReunion.transcription && (
                <div style={{ background: "#f0fff4", borderRadius: "8px", padding: "12px", border: `1px solid ${C.g2}` }}>
                  <div style={{ fontSize: "10px", color: C.g1, textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>🎙️ Transcription</div>
                  <div style={{ fontSize: "13px", color: C.text, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>{selectedReunion.transcription}</div>
                </div>
              )}
              {selectedReunion.rapport && (
                <div style={{ background: "#f0f4ff", borderRadius: "8px", padding: "12px", border: `1px solid ${C.g4}` }}>
                  <div style={{ fontSize: "10px", color: C.g4, textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>📝 Rapport</div>
                  <div style={{ fontSize: "13px", color: C.text, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>{selectedReunion.rapport}</div>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setSelectedReunion(null)} style={{ width: "100%", padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Don */}
      {showDonModal && editingDon && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "480px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: "800", color: C.text }}>{editingDon.id ? "✏️ Modifier le don" : "➕ Nouveau don"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[["Nom du donateur", "nom", "text"], ["Email", "email", "email"], ["Montant (€)", "montant", "number"]].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>{label}</label>
                  <input type={type} value={(editingDon as any)[field] ?? ""}
                    onChange={e => setEditingDon({ ...editingDon, [field]: type === "number" ? parseFloat(e.target.value) : e.target.value })}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box", color: C.text }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Type</label>
                <select value={editingDon.type ?? "don"} onChange={e => setEditingDon({ ...editingDon, type: e.target.value })}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", color: C.text }}>
                  <option value="don">Don</option><option value="adhesion">Adhésion</option><option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Statut</label>
                <select value={editingDon.statut ?? "en_attente"} onChange={e => setEditingDon({ ...editingDon, statut: e.target.value })}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", color: C.text }}>
                  <option value="en_attente">⏳ En attente</option><option value="recu">✅ Reçu</option><option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Agent lié</label>
                <select value={editingDon.agent_id ?? ""} onChange={e => setEditingDon({ ...editingDon, agent_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", color: C.text }}>
                  <option value="">— Aucun —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.prenom ? `${a.prenom} ${a.nom}` : a.nom}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Notes</label>
                <textarea value={editingDon.notes ?? ""} onChange={e => setEditingDon({ ...editingDon, notes: e.target.value })} rows={3}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box", color: C.text, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={handleSaveDon} style={{ flex: 1, padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>✅ Sauvegarder</button>
              <button onClick={() => { setShowDonModal(false); setEditingDon(null); }} style={{ flex: 1, padding: "10px", background: C.g4, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agent */}
      {showAgentModal && editingAgent && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: "800", color: C.text }}>{editingAgent.id ? "✏️ Modifier l'agent" : "➕ Nouvel agent"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[["Nom *", "nom", "text"], ["Prénom", "prenom", "text"], ["Email", "email", "email"], ["Téléphone", "telephone", "text"], ["Zone", "zone", "text"]].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>{label}</label>
                  <input type={type} value={(editingAgent as any)[field] ?? ""} onChange={e => setEditingAgent({ ...editingAgent, [field]: e.target.value })}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box", color: C.text }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Rôle</label>
                <select value={editingAgent.role ?? "benevole"} onChange={e => setEditingAgent({ ...editingAgent, role: e.target.value })}
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", color: C.text }}>
                  <option value="benevole">Bénévole</option><option value="superviseur">Superviseur</option><option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", fontWeight: "600" }}>Mot de passe {editingAgent.id ? "(laisser vide = inchangé)" : "*"}</label>
                <input type="password" value={agentPassword} onChange={e => setAgentPassword(e.target.value)} placeholder="••••••••"
                  style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginTop: "4px", fontSize: "13px", boxSizing: "border-box", color: C.text }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={handleSaveAgent} style={{ flex: 1, padding: "10px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>✅ Sauvegarder</button>
              <button onClick={() => { setShowAgentModal(false); setEditingAgent(null); }} style={{ flex: 1, padding: "10px", background: C.g4, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Templates */}
      {showTemplateModal && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
  <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: C.text }}>📋 Templates Formulaires</h2>
  <button onClick={() => { setSelectedTemplate({ id: 0, title: "", questions: [], isActive: true, createdAt: "", updatedAt: "" }); setShowTemplateModal(false); }} style={{ padding: "8px 14px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>➕ Nouveau</button>
</div>
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

   {/* Modal Edit Template */}
      {selectedTemplate && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "14px", padding: "24px", width: "500px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: "800", color: C.text }}>
              {!selectedTemplate.id || selectedTemplate.id === 0 ? "➕ Nouveau template" : `✏️ Modifier ${selectedTemplate.title}`}
            </h2>
            <label style={{ fontSize: "12px", color: C.muted }}>Titre</label>
            <input value={selectedTemplate.title} onChange={e => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
              style={{ display: "block", width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", marginBottom: "16px", fontSize: "14px", boxSizing: "border-box", color: C.text }} />
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: C.text }}>Questions</h3>
            {selectedTemplate.questions.map((q, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input value={q} onChange={e => { const nq = [...selectedTemplate.questions]; nq[idx] = e.target.value; setSelectedTemplate({ ...selectedTemplate, questions: nq }); }}
                  style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", color: C.text }} />
                <button onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: selectedTemplate.questions.filter((_, i) => i !== idx) })} style={btn("#b71c1c")}>🗑</button>
              </div>
            ))}
            <button onClick={() => setSelectedTemplate({ ...selectedTemplate, questions: [...selectedTemplate.questions, ""] })} style={{ ...btn(C.g4), marginBottom: "16px" }}>+ Question</button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => {
                const isNew = !selectedTemplate.id || selectedTemplate.id === 0;
                fetch(isNew ? `/api/admin/forms/templates` : `/api/admin/forms/templates/${selectedTemplate.id}`,
                  { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selectedTemplate) }
                ).then(() => { fetchTemplates(); setSelectedTemplate(null); });
              }} style={{ flex: 1, padding: "10px", background: C.g1, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>✅ Sauvegarder</button>
              <button onClick={() => setSelectedTemplate(null)} style={{ flex: 1, padding: "10px", background: C.g4, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Archivage groupé */}
      {showArchiveConfirm && (
        <div style={backdrop}>
          <div style={{ background: C.white, borderRadius: "16px", padding: "32px", width: "420px", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗂️</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: C.text, margin: "0 0 10px" }}>
              Confirmer l'archivage
            </h2>
            <p style={{ color: C.muted, fontSize: "14px", lineHeight: 1.6, margin: "0 0 8px" }}>
              Vous êtes sur le point d'archiver
            </p>
            <p style={{ color: C.g1, fontSize: "22px", fontWeight: "800", margin: "0 0 8px" }}>
              {selectedIds.size} fiche{selectedIds.size > 1 ? "s" : ""}
            </p>
            <p style={{ color: C.muted, fontSize: "13px", margin: "0 0 28px" }}>
              Ces fiches seront déplacées dans les archives. Cette action est réversible.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowArchiveConfirm(false)}
                style={{ flex: 1, padding: "12px", background: C.light, color: C.text, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={handleBulkArchive}
                style={{ flex: 1, padding: "12px", background: "#c97a00", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                ✅ Confirmer l'archivage
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </ProtectedRoute>
  );
}

const tdS: React.CSSProperties = { padding: "10px 13px", color: "#111", verticalAlign: "middle" };
const backdrop: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" };
const btn = (bg: string, color = "#fff"): React.CSSProperties => ({ padding: "5px 10px", background: bg, color, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" });
const hBtn: React.CSSProperties = { padding: "4px 10px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "10px", fontWeight: "600", height: "44px", display: "flex", alignItems: "center" };