"use client";
// app/visit/page.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QuizForm from "@/components/QuizForm";

const C = {
  g1: "#1a6b2e", g2: "#2d8a4e", g3: "#1a7a6b", g4: "#1a3a6b",
  light: "#f0f7f4", text: "#111111", muted: "#666666", border: "#d9e8e0", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const QUARTIERS = ["Austerlitz","Butte-aux-Cailles","Croulebarbe","Gare","Glacière","Gobelins",
  "Maison-Blanche","Olympiades","Périchaux","Place d'Italie","Tolbiac","BnF","Jeanne d'Arc","Autre"];

type View = "dashboard" | "visite" | "boitage" | "tractage" | "reunion" | "evenement";

interface Evenement {
  id: number; titre: string; date: string; heure?: string;
  adresse?: string; sujets?: string; photo_url?: string;
}
interface VisitRecord {
  id?: number; nom_benevole: string; adresse: string; quartier: string;
  batiment?: boolean; immeuble?: boolean; maison?: boolean;
  intention_vote?: string; inscrit_listes?: string; souhait_don?: boolean; date_visite?: string;
}
interface TerrainRecord {
  id: number; quartier: string; adresse?: string; nb_tracts: number;
  nb_boites?: number; nb_portes?: number; nom_benevole?: string; date: string; commentaire?: string;
}
interface Reunion {
  id: number; titre: string; date: string; lieu?: string; ordre_du_jour?: string;
  participants?: string; transcription?: string; rapport?: string; agent_nom?: string; created_at: string;
}

const inp: React.CSSProperties = {
  width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`,
  borderRadius: "10px", fontSize: "14px", color: C.text, boxSizing: "border-box", background: C.white,
};
const lbl: React.CSSProperties = {
  fontSize: "11px", fontWeight: "700", color: C.muted,
  textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "5px",
};
const card: React.CSSProperties = {
  background: C.white, borderRadius: "14px", padding: "16px",
  border: `1px solid ${C.border}`, marginBottom: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

function AudioRecorder({ onTranscription, compact = false }: { onTranscription: (text: string, keywords: string[]) => void; compact?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState("");
  const recognitionRef = useRef<any>(null);
  const fullRef = useRef("");

  const STOP = new Set(["le","la","les","un","une","des","de","du","et","en","à","au","aux","je","tu","il","elle","nous","vous","ils","elles","mon","ma","mes","son","sa","ses","que","qui","dans","sur","sous","avec","sans","pour","par","mais","ou","donc","car","ne","pas","plus","très","bien","aussi","comme","est","sont","ont","fait","va","c'est","l'","d'","n'","m'"]);
  const extractKw = (t: string) => {
    const freq: Record<string, number> = {};
    t.toLowerCase().replace(/[.,!?;:'"()\-]/g, " ").split(/\s+/)
      .filter(w => w.length > 3 && !STOP.has(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
  };

  const start = () => {
    setError("");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("⚠️ Reconnaissance vocale non supportée. Utilisez Safari ou Chrome."); return; }
    try {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "fr-FR";
      fullRef.current = "";
      r.onresult = (e: any) => {
        let final = "", interim = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
          else interim += e.results[i][0].transcript;
        }
        fullRef.current = final;
        setText(final + interim);
      };
      r.onerror = (e: any) => {
        if (e.error === "not-allowed") setError("⚠️ Microphone bloqué.");
        else if (e.error === "service-not-allowed") setError("⚠️ Brave bloque la reconnaissance vocale.");
        else setError(`Erreur: ${e.error}`);
        setRecording(false);
      };
      r.onend = () => setRecording(false);
      recognitionRef.current = r;
      r.start();
      setRecording(true);
    } catch { setError("Impossible de démarrer l'enregistrement."); }
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    const kw = extractKw(fullRef.current || text);
    setKeywords(kw);
  };

  const confirm = () => {
    const kw = keywords.length > 0 ? keywords : extractKw(text);
    onTranscription(text, kw);
  };

  return (
    <div style={{ background: C.light, borderRadius: "12px", padding: compact ? "12px" : "16px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "16px" }}>🎙️</span>
        <span style={{ fontWeight: "700", color: C.text, fontSize: "14px" }}>Enregistrement vocal</span>
        {recording && <span style={{ background: "#fee2e2", color: "#b71c1c", padding: "2px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>● EN COURS</span>}
      </div>
      {error && <div style={{ background: "#fdecea", color: "#b71c1c", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "10px" }}>{error}</div>}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        <button onClick={recording ? stop : start}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: recording ? "#b71c1c" : C.g1, color: "white" }}>
          {recording ? "⏹ Arrêter" : "🔴 Démarrer"}
        </button>
        {text.trim() && !recording && (
          <button onClick={confirm}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: C.g4, color: "white" }}>
            ✅ Valider la transcription
          </button>
        )}
        {text.trim() && (
          <button onClick={() => { setText(""); setKeywords([]); fullRef.current = ""; }}
            style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${C.border}`, cursor: "pointer", fontWeight: "600", fontSize: "13px", background: C.white, color: C.muted }}>
            🗑 Effacer
          </button>
        )}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="La transcription apparaît ici en temps réel..." rows={4}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${C.border}`, fontSize: "13px", color: C.text, background: C.white, boxSizing: "border-box", resize: "vertical" }} />
      {keywords.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", marginBottom: "6px", fontWeight: "600" }}>🔑 Mots-clés</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {keywords.map(kw => <span key={kw} style={{ background: "#e8eef5", color: C.g4, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{kw}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function StatMini({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div style={{ background: C.white, borderRadius: "12px", padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, flex: 1, minWidth: "80px" }}>
      <div style={{ fontSize: "18px", marginBottom: "3px" }}>{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: "800", color }}>{value}</div>
      <div style={{ fontSize: "10px", color: C.muted, fontWeight: "600", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function Visit() {
  const router = useRouter();
  const agentName: string = typeof window !== "undefined" ? (localStorage.getItem("user") || "Bénévole") : "Bénévole";
  const today = new Date().toLocaleDateString("fr-FR");

  const [view, setView] = useState<View>("dashboard");
  const [formsSent, setFormsSent] = useState<VisitRecord[]>([]);
  const [lastFormId, setLastFormId] = useState<number | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [audioSaved, setAudioSaved] = useState(false);
  const [todayStats, setTodayStats] = useState({ total: 0, oui: 0, inscrits: 0, dons: 0 });

  const [boitages, setBoitages] = useState<TerrainRecord[]>([]);
  const [bForm, setBForm] = useState({ quartier: "", adresse: "", nb_tracts: "", nb_boites: "", commentaire: "" });
  const [bShow, setBShow] = useState(false);
  const [bSubmitting, setBSubmitting] = useState(false);

  const [tractages, setTractages] = useState<TerrainRecord[]>([]);
  const [tForm, setTForm] = useState({ quartier: "", adresse: "", nb_tracts: "", nb_portes: "", commentaire: "" });
  const [tShow, setTShow] = useState(false);
  const [tSubmitting, setTSubmitting] = useState(false);

  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [rForm, setRForm] = useState({ titre: "", date: today, lieu: "", ordre_du_jour: "", participants: "", transcription: "", rapport: "" });
  const [rShow, setRShow] = useState(false);
  const [rSubmitting, setRSubmitting] = useState(false);
  const [rStep, setRStep] = useState<"form" | "audio" | "rapport">("form");

  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };

  const fetchAll = async () => {
    try {
      const [forms, boit, tract, reun, even] = await Promise.all([
        fetch("/api/admin/forms/responses").then(r => r.json()),
        fetch("/api/boitage").then(r => r.json()),
        fetch("/api/tractage").then(r => r.json()),
        fetch("/api/reunions").then(r => r.json()),
        fetch("/api/evenements").then(r => r.json()),
      ]);
      if (Array.isArray(forms)) {
        const mine = forms.filter((r: any) => r.nom_benevole === agentName && r.date_visite === today);
        setFormsSent(mine);
        setTodayStats({ total: mine.length, oui: mine.filter((r: any) => r.intention_vote === "Oui").length, inscrits: mine.filter((r: any) => r.inscrit_listes === "Oui").length, dons: mine.filter((r: any) => r.souhait_don).length });
      }
      if (Array.isArray(boit)) setBoitages(boit.filter((b: any) => b.nom_benevole === agentName));
      if (Array.isArray(tract)) setTractages(tract.filter((t: any) => t.nom_benevole === agentName));
      if (Array.isArray(reun)) setReunions(reun.filter((r: any) => r.agent_nom === agentName));
      if (Array.isArray(even)) setEvenements(even);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, [agentName]);

  const handleFormSubmit = (formData: any) => {
    setFormsSent(prev => [formData, ...prev]);
    if (formData?.id) setLastFormId(formData.id);
    setTodayStats(prev => ({ total: prev.total + 1, oui: prev.oui + (formData.intention_vote === "Oui" ? 1 : 0), inscrits: prev.inscrits + (formData.inscrit_listes === "Oui" ? 1 : 0), dons: prev.dons + (formData.souhait_don ? 1 : 0) }));
    setShowAudio(true);
  };

  const saveAudio = async (transcription: string, keywords: string[]) => {
    if (!lastFormId || !transcription.trim()) return;
    try {
      await fetch("/api/audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form_id: lastFormId, transcription, mots_cles: keywords }) });
      setAudioSaved(true);
      showSuccess("Audio sauvegardé ✅");
    } catch {}
  };

  const submitBoitage = async () => {
    if (!bForm.quartier) { alert("Sélectionne un quartier."); return; }
    setBSubmitting(true);
    try {
      await fetch("/api/boitage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...bForm, nom_benevole: agentName, date: today }) });
      setBForm({ quartier: "", adresse: "", nb_tracts: "", nb_boites: "", commentaire: "" });
      setBShow(false); fetchAll(); showSuccess("Boîtage enregistré ✅");
    } catch { alert("Erreur envoi"); }
    setBSubmitting(false);
  };

  const submitTractage = async () => {
    if (!tForm.quartier) { alert("Sélectionne un quartier."); return; }
    setTSubmitting(true);
    try {
      await fetch("/api/tractage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...tForm, nom_benevole: agentName, date: today }) });
      setTForm({ quartier: "", adresse: "", nb_tracts: "", nb_portes: "", commentaire: "" });
      setTShow(false); fetchAll(); showSuccess("Tractage enregistré ✅");
    } catch { alert("Erreur envoi"); }
    setTSubmitting(false);
  };

  const submitReunion = async () => {
    if (!rForm.titre || !rForm.date) { alert("Titre et date obligatoires."); return; }
    setRSubmitting(true);
    try {
      await fetch("/api/reunions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...rForm, agent_nom: agentName }) });
      setRForm({ titre: "", date: today, lieu: "", ordre_du_jour: "", participants: "", transcription: "", rapport: "" });
      setRShow(false); setRStep("form"); fetchAll(); showSuccess("Réunion enregistrée ✅");
    } catch { alert("Erreur envoi"); }
    setRSubmitting(false);
  };

  const intentionColor = (v?: string) => {
    if (v === "Oui") return { bg: "#e8f5ee", color: C.g1 };
    if (v === "Non") return { bg: "#fdecea", color: "#b71c1c" };
    return { bg: "#fef9e7", color: "#7d5a00" };
  };

  const todayBoitages = boitages.filter(b => b.date === today);
  const todayTractages = tractages.filter(t => t.date === today);

  const navItems: { key: View; icon: string; label: string; color: string }[] = [
    { key: "dashboard", icon: "🏠", label: "Accueil", color: C.g1 },
    { key: "visite", icon: "📋", label: "Visite", color: C.g1 },
    { key: "boitage", icon: "📬", label: "Boîtage", color: C.g4 },
    { key: "tractage", icon: "📄", label: "Tractage", color: "#c97a00" },
    { key: "reunion", icon: "🤝", label: "Réunion", color: C.g3 },
  ];

  const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div style={{ background: GRADIENT, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div onClick={onBack || (() => setView("dashboard"))} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="C13" style={{ height: "38px" }} onError={e => (e.currentTarget.style.display = "none")} />
          {onBack && <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px" }}>←</span>}
        </div>
        <div>
          <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>{agentName}</div>
        </div>
      </div>
      <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("user"); router.push("/login"); }}
        style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
        Déconnexion 🚪
      </button>
    </div>
  );

  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100, boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
      {navItems.map(n => (
        <button key={n.key} onClick={() => { setView(n.key); setBShow(false); setTShow(false); setRShow(false); setShowAudio(false); }}
          style={{ flex: 1, padding: "8px 4px 10px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: view === n.key ? "22px" : "18px", transition: "font-size 0.15s" }}>{n.icon}</span>
          <span style={{ fontSize: "9px", fontWeight: "700", color: view === n.key ? n.color : C.muted, textTransform: "uppercase" }}>{n.label}</span>
          {view === n.key && <div style={{ width: "20px", height: "3px", borderRadius: "2px", background: n.color, marginTop: "1px" }} />}
        </button>
      ))}
    </div>
  );

  const SuccessToast = () => successMsg ? (
    <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", background: "#1a6b2e", color: "white", padding: "10px 20px", borderRadius: "30px", fontSize: "13px", fontWeight: "700", zIndex: 200, boxShadow: "0 4px 14px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
      {successMsg}
    </div>
  ) : null;

  const pageStyle: React.CSSProperties = { minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif", paddingBottom: "75px" };
  const content: React.CSSProperties = { padding: "16px", maxWidth: "600px", margin: "0 auto" };

  if (view === "dashboard") return (
    <div style={pageStyle}>
      <Header title="Dashboard" />
      <SuccessToast />
      <div style={content}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>📅 Aujourd'hui — {today}</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1 }}>
            <StatMini icon="🏠" value={todayStats.total} label="Visites" color={C.g1} />
            <StatMini icon="🗳️" value={todayStats.oui} label="Vote Oui" color={C.g3} />
            <StatMini icon="📝" value={todayStats.inscrits} label="Inscrits" color={C.g4} />
            <StatMini icon="💛" value={todayStats.dons} label="Dons" color="#c9a800" />
          </div>
          {evenements.length > 0 && (() => {
            const e = [...evenements].sort((a, b) => a.date.localeCompare(b.date))[0];
            return (
              <div onClick={() => setView("evenement")} style={{ width: "130px", flexShrink: 0, background: C.white, borderRadius: "14px", border: `2px solid ${C.g1}`, padding: "10px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                {e.photo_url ? <img src={e.photo_url} alt="" style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                  : <div style={{ width: "100%", height: "70px", background: C.light, borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>📅</div>}
                <div style={{ fontSize: "11px", fontWeight: "800", color: C.g1, textAlign: "center" }}>{e.date}{e.heure ? ` · ${e.heure}` : ""}</div>
                {e.adresse && <div style={{ fontSize: "10px", color: C.muted, textAlign: "center", marginTop: "2px" }}>{e.adresse}</div>}
              </div>
            );
          })()}
        </div>

        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>⚡ Actions rapides</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          {[
            { key: "visite" as View, icon: "📋", label: "Nouvelle visite", sub: "Questionnaire citoyen", color: C.g1 },
            { key: "boitage" as View, icon: "📬", label: "Boîtage", sub: "Distribuer tracts en boîtes", color: C.g4 },
            { key: "tractage" as View, icon: "📄", label: "Tractage", sub: "Distribution en rue", color: "#c97a00" },
            { key: "reunion" as View, icon: "🤝", label: "Réunion", sub: "Audio + rapport", color: C.g3 },
          ].map(a => (
            <button key={a.key} onClick={() => setView(a.key)}
              style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: "14px", padding: "16px", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{a.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{a.label}</div>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{a.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <button onClick={() => setView("evenement")} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "10px 40px", cursor: "pointer", color: C.text, fontWeight: "600", fontSize: "13px" }}>
            📅 Événement
          </button>
        </div>

        <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>🕐 Historique du jour</div>
        {formsSent.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>Aucune visite aujourd'hui — lancez-vous ! 🚀</div>
        ) : formsSent.slice(0, 5).map((f, i) => {
          const ic = intentionColor(f.intention_vote);
          return (
            <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "700", fontSize: "13px", color: C.text, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.adresse || "Adresse inconnue"}{f.id && <span style={{ fontSize: "10px", color: C.muted, fontWeight: "400", marginLeft: "5px" }}>#{f.id}</span>}
                </div>
                <div style={{ fontSize: "12px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {f.quartier && <span style={{ background: "#e8f5ee", color: C.g1, padding: "1px 7px", borderRadius: "8px", fontWeight: "600" }}>{f.quartier}</span>}
                  {f.souhait_don && <span>💛</span>}
                </div>
              </div>
              {f.intention_vote && <span style={{ background: ic.bg, color: ic.color, padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>{f.intention_vote}</span>}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );

  if (view === "visite") return (
    <div style={pageStyle}>
      <Header title="📋 Visite citoyenne" onBack={() => setView("dashboard")} />
      <SuccessToast />
      <div style={content}>
        {!showAudio ? (
          <QuizForm agentName={agentName} onBack={() => setView("dashboard")} onSubmit={(d: any) => { handleFormSubmit(d); showSuccess("Visite enregistrée ✅"); }} />
        ) : (
          <div>
            <div style={{ ...card, background: "#e8f5ee", border: `1px solid ${C.g1}` }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.g1, marginBottom: "4px" }}>✅ Visite enregistrée {lastFormId && `— #${lastFormId}`}</div>
              <div style={{ fontSize: "12px", color: C.g1 }}>Tu peux enregistrer une note audio optionnelle ci-dessous.</div>
            </div>
            <AudioRecorder compact onTranscription={saveAudio} />
            {audioSaved && <div style={{ ...card, background: "#e8f5ee", border: `1px solid ${C.g1}`, color: C.g1, fontWeight: "700", fontSize: "13px", textAlign: "center" }}>🎙️ Audio lié à la visite #{lastFormId}</div>}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => { setShowAudio(false); setAudioSaved(false); }}
                style={{ flex: 1, padding: "13px", background: GRADIENT, color: "white", border: "none", borderRadius: "11px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                ➕ Nouvelle visite
              </button>
              <button onClick={() => setView("dashboard")}
                style={{ flex: 1, padding: "13px", background: C.white, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: "11px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                🏠 Accueil
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );

  if (view === "boitage") return (
    <div style={pageStyle}>
      <Header title="📬 Boîtage" onBack={() => setView("dashboard")} />
      <SuccessToast />
      <div style={content}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <StatMini icon="📬" value={todayBoitages.length} label="Aujourd'hui" color={C.g4} />
          <StatMini icon="📄" value={boitages.reduce((s, b) => s + b.nb_tracts, 0)} label="Tracts total" color={C.g1} />
          <StatMini icon="📭" value={boitages.reduce((s, b) => s + (b.nb_boites ?? 0), 0)} label="Boîtes total" color={C.g3} />
        </div>
        {!bShow ? (
          <button onClick={() => setBShow(true)} style={{ width: "100%", padding: "15px", background: GRADIENT, color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>
            ➕ Nouveau boîtage
          </button>
        ) : (
          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800" }}>📬 Nouveau boîtage</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={lbl}>Quartier *</label>
                <select style={inp} value={bForm.quartier} onChange={e => setBForm({ ...bForm, quartier: e.target.value })}>
                  <option value="">— Sélectionner —</option>{QUARTIERS.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Adresse exacte</label>
                <input style={inp} placeholder="Ex: 12 rue de Tolbiac" value={bForm.adresse} onChange={e => setBForm({ ...bForm, adresse: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={lbl}>Nb tracts</label><input type="number" min="0" style={inp} value={bForm.nb_tracts} onChange={e => setBForm({ ...bForm, nb_tracts: e.target.value })} /></div>
                <div><label style={lbl}>Nb boîtes</label><input type="number" min="0" style={inp} value={bForm.nb_boites} onChange={e => setBForm({ ...bForm, nb_boites: e.target.value })} /></div>
              </div>
              <div><label style={lbl}>Commentaire</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: "70px" }} value={bForm.commentaire} onChange={e => setBForm({ ...bForm, commentaire: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={submitBoitage} disabled={bSubmitting} style={{ flex: 2, padding: "12px", background: bSubmitting ? "#aaa" : GRADIENT, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>{bSubmitting ? "Envoi..." : "✅ Enregistrer"}</button>
                <button onClick={() => setBShow(false)} style={{ flex: 1, padding: "12px", background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
        <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: "10px" }}>🕐 Historique</h3>
        {boitages.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>Aucun boîtage — lancez-vous ! 📬</div>
        ) : boitages.map(b => (
          <div key={b.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ background: "#e8eef5", color: C.g4, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>{b.quartier}</span>
              <span style={{ fontSize: "11px", color: C.muted }}>{b.date}</span>
            </div>
            {b.adresse && <div style={{ fontSize: "12px", color: C.muted, marginBottom: "5px" }}>📍 {b.adresse}</div>}
            <div style={{ display: "flex", gap: "14px", fontSize: "13px" }}>
              <span>📄 <strong>{b.nb_tracts}</strong> tracts</span>
              <span>📬 <strong>{b.nb_boites ?? 0}</strong> boîtes</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  if (view === "tractage") return (
    <div style={pageStyle}>
      <Header title="📄 Tractage" onBack={() => setView("dashboard")} />
      <SuccessToast />
      <div style={content}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <StatMini icon="📄" value={todayTractages.length} label="Aujourd'hui" color="#c97a00" />
          <StatMini icon="🗂️" value={tractages.reduce((s, t) => s + t.nb_tracts, 0)} label="Tracts total" color={C.g1} />
          <StatMini icon="🚪" value={tractages.reduce((s, t) => s + (t.nb_portes ?? 0), 0)} label="Portes total" color={C.g3} />
        </div>
        {!tShow ? (
          <button onClick={() => setTShow(true)} style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, #c97a00, #e67e22)`, color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>
            ➕ Nouveau tractage
          </button>
        ) : (
          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800" }}>📄 Nouveau tractage</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={lbl}>Quartier *</label>
                <select style={inp} value={tForm.quartier} onChange={e => setTForm({ ...tForm, quartier: e.target.value })}>
                  <option value="">— Sélectionner —</option>{QUARTIERS.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Adresse exacte</label>
                <input style={inp} value={tForm.adresse} onChange={e => setTForm({ ...tForm, adresse: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={lbl}>Nb tracts</label><input type="number" min="0" style={inp} value={tForm.nb_tracts} onChange={e => setTForm({ ...tForm, nb_tracts: e.target.value })} /></div>
                <div><label style={lbl}>Nb portes</label><input type="number" min="0" style={inp} value={tForm.nb_portes} onChange={e => setTForm({ ...tForm, nb_portes: e.target.value })} /></div>
              </div>
              <div><label style={lbl}>Commentaire</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: "70px" }} value={tForm.commentaire} onChange={e => setTForm({ ...tForm, commentaire: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={submitTractage} disabled={tSubmitting} style={{ flex: 2, padding: "12px", background: tSubmitting ? "#aaa" : `linear-gradient(135deg, #c97a00, #e67e22)`, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>{tSubmitting ? "Envoi..." : "✅ Enregistrer"}</button>
                <button onClick={() => setTShow(false)} style={{ flex: 1, padding: "12px", background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
        <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: "10px" }}>🕐 Historique</h3>
        {tractages.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>Aucun tractage — lancez-vous ! 📄</div>
        ) : tractages.map(t => (
          <div key={t.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ background: "#fef3e2", color: "#c97a00", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>{t.quartier}</span>
              <span style={{ fontSize: "11px", color: C.muted }}>{t.date}</span>
            </div>
            {t.adresse && <div style={{ fontSize: "12px", color: C.muted, marginBottom: "5px" }}>📍 {t.adresse}</div>}
            <div style={{ display: "flex", gap: "14px", fontSize: "13px" }}>
              <span>📄 <strong>{t.nb_tracts}</strong> tracts</span>
              {t.nb_portes !== undefined && <span>🚪 <strong>{t.nb_portes}</strong> portes</span>}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  if (view === "reunion") return (
    <div style={pageStyle}>
      <Header title="🤝 Réunions" onBack={() => setView("dashboard")} />
      <SuccessToast />
      <div style={content}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <StatMini icon="🤝" value={reunions.length} label="Total" color={C.g3} />
          <StatMini icon="📝" value={reunions.filter(r => r.transcription).length} label="Transcrites" color={C.g1} />
          <StatMini icon="📋" value={reunions.filter(r => r.rapport).length} label="Rapports" color={C.g4} />
        </div>
        {!rShow ? (
          <button onClick={() => { setRShow(true); setRStep("form"); }}
            style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, ${C.g3}, ${C.g1})`, color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>
            ➕ Nouvelle réunion
          </button>
        ) : (
          <div style={card}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {[{ k: "form", l: "1. Infos" }, { k: "audio", l: "2. Audio" }, { k: "rapport", l: "3. Rapport" }].map(s => (
                <button key={s.k} onClick={() => setRStep(s.k as any)}
                  style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "11px", cursor: "pointer", background: rStep === s.k ? C.g3 : C.light, color: rStep === s.k ? "white" : C.muted }}>
                  {s.l}
                </button>
              ))}
            </div>
            {rStep === "form" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div><label style={lbl}>Titre *</label><input style={inp} value={rForm.titre} onChange={e => setRForm({ ...rForm, titre: e.target.value })} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div><label style={lbl}>Date *</label><input type="date" style={inp} value={rForm.date.split("/").reverse().join("-")} onChange={e => setRForm({ ...rForm, date: e.target.value.split("-").reverse().join("/") })} /></div>
                  <div><label style={lbl}>Lieu</label><input style={inp} value={rForm.lieu} onChange={e => setRForm({ ...rForm, lieu: e.target.value })} /></div>
                </div>
                <div><label style={lbl}>Ordre du jour</label><textarea style={{ ...inp, resize: "vertical", minHeight: "70px" }} value={rForm.ordre_du_jour} onChange={e => setRForm({ ...rForm, ordre_du_jour: e.target.value })} /></div>
                <div><label style={lbl}>Participants</label><input style={inp} value={rForm.participants} onChange={e => setRForm({ ...rForm, participants: e.target.value })} /></div>
                <button onClick={() => setRStep("audio")} style={{ padding: "12px", background: `linear-gradient(135deg, ${C.g3}, ${C.g1})`, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Suivant → Audio</button>
              </div>
            )}
            {rStep === "audio" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <AudioRecorder onTranscription={(text) => { setRForm(prev => ({ ...prev, transcription: text })); showSuccess("Transcription enregistrée ✅"); }} />
                {rForm.transcription && <div style={{ background: C.light, borderRadius: "10px", padding: "12px", fontSize: "13px" }}><strong>Transcription :</strong> {rForm.transcription}</div>}
                <button onClick={() => setRStep("rapport")} style={{ padding: "12px", background: `linear-gradient(135deg, ${C.g3}, ${C.g1})`, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Suivant → Rapport</button>
              </div>
            )}
            {rStep === "rapport" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div><label style={lbl}>Rapport</label><textarea style={{ ...inp, resize: "vertical", minHeight: "120px" }} value={rForm.rapport} onChange={e => setRForm({ ...rForm, rapport: e.target.value })} /></div>
                {rForm.transcription && !rForm.rapport && (
                  <button onClick={() => setRForm(prev => ({ ...prev, rapport: prev.transcription }))}
                    style={{ padding: "8px", background: C.light, color: C.muted, border: `1px solid ${C.border}`, borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
                    📋 Utiliser la transcription comme rapport
                  </button>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={submitReunion} disabled={rSubmitting} style={{ flex: 2, padding: "12px", background: rSubmitting ? "#aaa" : `linear-gradient(135deg, ${C.g3}, ${C.g1})`, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>{rSubmitting ? "Envoi..." : "✅ Enregistrer"}</button>
                  <button onClick={() => { setRShow(false); setRStep("form"); }} style={{ flex: 1, padding: "12px", background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        )}
        <h3 style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: "10px" }}>🕐 Réunions précédentes</h3>
        {reunions.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>Aucune réunion enregistrée.</div>
        ) : reunions.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>{r.titre}</div>
              <span style={{ fontSize: "11px", color: C.muted }}>{r.date}</span>
            </div>
            {r.lieu && <div style={{ fontSize: "12px", color: C.muted }}>📍 {r.lieu}</div>}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
              {r.transcription && <span style={{ background: "#e8f5ee", color: C.g1, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>🎙️ Transcrit</span>}
              {r.rapport && <span style={{ background: "#e8eef5", color: C.g4, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>📋 Rapport</span>}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );

  if (view === "evenement") return (
    <div style={pageStyle}>
      <Header title="Événements" onBack={() => setView("dashboard")} />
      <div style={content}>
        {evenements.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: C.muted, fontSize: "13px", border: `1px dashed ${C.border}` }}>Aucun événement à venir</div>
        ) : Object.entries(
          [...evenements].sort((a, b) => a.date.localeCompare(b.date)).reduce((acc, e) => {
            if (!acc[e.date]) acc[e.date] = [];
            acc[e.date].push(e);
            return acc;
          }, {} as Record<string, Evenement[]>)
        ).map(([date, items]) => (
          <div key={date}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.g1, textTransform: "uppercase", padding: "8px 0 4px", borderBottom: `1px solid ${C.border}`, marginBottom: "8px" }}>
              📆 {date}
            </div>
            {items.map(e => (
              <div key={e.id} style={{ ...card, display: "flex", gap: "14px", alignItems: "flex-start" }}>
                {e.photo_url ? <img src={e.photo_url} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                  : <div style={{ width: "72px", height: "72px", background: C.light, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>📅</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>{e.titre}</div>
                  <div style={{ fontSize: "12px", color: C.g1, fontWeight: "700" }}>{e.date}{e.heure ? ` · ${e.heure}` : ""}</div>
                  {e.adresse && <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>📍 {e.adresse}</div>}
                  {e.sujets && <div style={{ fontSize: "12px", marginTop: "6px", borderTop: `1px solid ${C.border}`, paddingTop: "6px" }}>{e.sujets}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}