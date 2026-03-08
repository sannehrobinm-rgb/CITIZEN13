import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizForm from "../components/QuizForm";
import AudioRecorder from "../components/AudioRecorder";

const C = {
  g1: "#1a6b2e", g2: "#2d8a4e", g3: "#1a7a6b", g4: "#1a3a6b",
  light: "#f0f7f4", text: "#111111", muted: "#555555", border: "#d9e8e0", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const API = "http://localhost:3000";

interface VisitRecord {
  id?: number;
  nom_benevole: string;
  adresse: string;
  quartier: string;
  batiment?: boolean;
  immeuble?: boolean;
  maison?: boolean;
  intention_vote?: string;
  inscrit_listes?: string;
  souhait_don?: boolean;
  date_visite?: string;
}

export default function Visit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent } = location.state || {};
  const agentName: string = agent || localStorage.getItem("user") || "Bénévole";

  const [view, setView] = useState<"dashboard" | "form" | "audio">("dashboard");
  const [formsSent, setFormsSent] = useState<VisitRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [lastFormId, setLastFormId] = useState<number | null>(null);
  const [todayStats, setTodayStats] = useState({ total: 0, oui: 0, inscrits: 0, dons: 0 });

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await fetch(`${API}/api/admin/forms/responses`);
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const today = new Date().toLocaleDateString("fr-FR");
        const mine = data.filter((r: any) => r.nom_benevole === agentName && r.date_visite === today);
        setFormsSent(mine);
        setTodayStats({
          total: mine.length,
          oui: mine.filter((r: any) => r.intention_vote === "Oui").length,
          inscrits: mine.filter((r: any) => r.inscrit_listes === "Oui").length,
          dons: mine.filter((r: any) => r.souhait_don).length,
        });
      } catch {}
    };
    fetchToday();
  }, [agentName]);

  const handleFormSubmit = (formData: any) => {
    const newRecord: VisitRecord = { ...formData };
    setFormsSent(prev => [newRecord, ...prev]);
    if (formData?.id) setLastFormId(formData.id);
    setTodayStats(prev => ({
      total: prev.total + 1,
      oui: prev.oui + (formData.intention_vote === "Oui" ? 1 : 0),
      inscrits: prev.inscrits + (formData.inscrit_listes === "Oui" ? 1 : 0),
      dons: prev.dons + (formData.souhait_don ? 1 : 0),
    }));
    setView("dashboard");
  };

  const intentionColor = (v?: string) => {
    if (v === "Oui") return { bg: "#e8f5ee", color: C.g1 };
    if (v === "Non") return { bg: "#fdecea", color: "#b71c1c" };
    return { bg: "#fef9e7", color: "#7d5a00" };
  };

  const hdrBtn: React.CSSProperties = { background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", fontSize: "13px", fontWeight: "600" };

  // ── DASHBOARD ──
  if (view === "dashboard") return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: GRADIENT, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "40px", filter: "brightness(0) invert(1)" }} onError={e => (e.currentTarget.style.display = "none")} />
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>{agentName}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("user"); navigate("/login"); }} style={hdrBtn}>
          🚪 Déconnexion
        </button>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: "600px", margin: "0 auto" }}>

        {/* Stats du jour */}
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>📅 Aujourd'hui</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Visites", value: todayStats.total, icon: "🏠", color: C.g1 },
            { label: "Vote Oui", value: todayStats.oui, icon: "🗳️", color: C.g3 },
            { label: "Inscrits", value: todayStats.inscrits, icon: "📝", color: C.g4 },
            { label: "Dons", value: todayStats.dons, icon: "💛", color: "#7d5a00" },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: C.muted, fontWeight: "600", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>⚡ Actions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          <button onClick={() => setView("form")}
            style={{ background: GRADIENT, color: "white", border: "none", borderRadius: "12px", padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(26,107,46,0.3)" }}>
            <span style={{ fontSize: "26px" }}>📋</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700" }}>Nouvelle visite</div>
              <div style={{ fontSize: "12px", fontWeight: "400", opacity: 0.85, marginTop: "2px" }}>Remplir le questionnaire citoyen</div>
            </div>
          </button>
          <button onClick={() => setView("audio")}
            style={{ background: C.white, color: C.text, border: `2px solid ${C.border}`, borderRadius: "12px", padding: "16px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "26px" }}>🎙️</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600" }}>Mode audio</div>
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>Enregistrer et transcrire une note</div>
            </div>
          </button>
        </div>

        {/* Historique du jour */}
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>🕐 Historique du jour</div>
        {formsSent.length === 0 ? (
          <div style={{ background: C.white, borderRadius: "12px", padding: "28px", textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>
            Aucune visite aujourd'hui — lancez-vous ! 🚀
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {formsSent.map((f, i) => {
              const ic = intentionColor(f.intention_vote);
              return (
                <div key={i} style={{ background: C.white, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: C.text, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.adresse || "Adresse inconnue"}
                      {f.id && <span style={{ fontSize: "11px", color: C.muted, fontWeight: "400", marginLeft: "6px" }}>#{f.id}</span>}
                    </div>
                    <div style={{ fontSize: "12px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      {f.quartier && <span style={{ background: "#e8f5ee", color: C.g1, padding: "1px 7px", borderRadius: "8px", fontWeight: "600" }}>{f.quartier}</span>}
                      {f.maison && <span title="Maison">🏠</span>}
                      {f.immeuble && <span title="Immeuble">🏢</span>}
                      {f.batiment && <span title="Bâtiment">🏗</span>}
                      {f.souhait_don && <span title="Souhait don">💛</span>}
                    </div>
                  </div>
                  {f.intention_vote && (
                    <span style={{ background: ic.bg, color: ic.color, padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                      {f.intention_vote}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── MODE AUDIO ──
  if (view === "audio") return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: GRADIENT, padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setView("dashboard")} style={hdrBtn}>← Retour</button>
        <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>🎙️ Mode Audio</span>
      </div>
      <div style={{ padding: "20px 16px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ background: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <AudioRecorder notes={notes} setNotes={setNotes} formId={lastFormId} />
        </div>
      </div>
    </div>
  );

  // ── MODE FORMULAIRE ──
  return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: GRADIENT, padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setView("dashboard")} style={hdrBtn}>← Retour</button>
        <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>📋 Questionnaire citoyen</span>
      </div>
      <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        <QuizForm agentName={agentName} onBack={() => setView("dashboard")} onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
