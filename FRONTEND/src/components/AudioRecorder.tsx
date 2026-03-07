import { useState, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AudioRecorderProps {
  notes: string;
  setNotes: (value: string) => void;
  formId?: number | null; // lien avec quiz_forms
}

// ── Extraction mots-clés ─────────────────────────────────────
const STOP_WORDS = new Set([
  "le","la","les","un","une","des","de","du","et","en","à","au","aux",
  "je","tu","il","elle","nous","vous","ils","elles","mon","ma","mes",
  "son","sa","ses","notre","votre","leur","leurs","que","qui","quoi",
  "dans","sur","sous","avec","sans","pour","par","mais","ou","donc",
  "car","ni","si","ne","pas","plus","très","bien","aussi","comme",
  "est","sont","était","ont","avoir","être","fait","faire","va","vais",
  "je","c'est","c'","l'","d'","n'","m'","s'","qu'",
]);

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:'"()\-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

const API = "http://localhost:3000";

export default function AudioRecorder({ notes, setNotes, formId }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");

  const startRecording = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("🚫 Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    fullTranscriptRef.current = "";
    setSaved(false);
    setKeywords([]);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      fullTranscriptRef.current = final;
      setNotes(final + interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Erreur reconnaissance vocale :", event.error);
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);

      // Extraire les mots-clés dès l'arrêt
      const kw = extractKeywords(fullTranscriptRef.current || notes);
      setKeywords(kw);
    }
  };

  // ── Sauvegarder en DB ──
  const saveToDb = async () => {
    const transcription = fullTranscriptRef.current || notes;
    if (!transcription.trim()) {
      alert("Aucune transcription à sauvegarder.");
      return;
    }
    if (!formId) {
      alert("Soumets d'abord le formulaire pour lier l'audio.");
      return;
    }

    setSaving(true);
    try {
      const kw = keywords.length > 0 ? keywords : extractKeywords(transcription);
      await fetch(`${API}/api/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          transcription,
          mots_cles: kw,
        }),
      });
      setKeywords(kw);
      setSaved(true);
    } catch (err) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ──
  const C = {
    g1: "#1a6b2e",
    g4: "#1a3a6b",
    light: "#f0f7f4",
    border: "#d9e8e0",
    text: "#111",
    muted: "#555",
  };

  return (
    <div style={{ marginTop: "12px", background: C.light, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}` }}>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span style={{ fontSize: "18px" }}>🎙️</span>
        <span style={{ fontWeight: "700", color: C.text, fontSize: "14px" }}>Enregistrement vocal</span>
        {recording && (
          <span style={{ background: "#fee2e2", color: "#b71c1c", padding: "2px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", animation: "pulse 1s infinite" }}>
            ● EN COURS
          </span>
        )}
        {saved && (
          <span style={{ background: "#e8f5ee", color: C.g1, padding: "2px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>
            ✅ Sauvegardé
          </span>
        )}
      </div>

      {/* Bouton enregistrement */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontWeight: "600", fontSize: "13px",
            background: recording ? "#b71c1c" : C.g1,
            color: "white",
          }}
        >
          {recording ? "⏹️ Arrêter" : "🔴 Démarrer"}
        </button>

        <button
          onClick={saveToDb}
          disabled={saving || !notes.trim()}
          style={{
            padding: "8px 16px", borderRadius: "8px", border: "none", cursor: saving ? "wait" : "pointer",
            fontWeight: "600", fontSize: "13px",
            background: saved ? "#e8f5ee" : C.g4,
            color: saved ? C.g1 : "white",
            opacity: !notes.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "⏳ Sauvegarde..." : saved ? "✅ Sauvegardé" : "💾 Sauvegarder"}
        </button>

        {notes.trim() && (
          <button
            onClick={() => { setNotes(""); setKeywords([]); setSaved(false); fullTranscriptRef.current = ""; }}
            style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${C.border}`, cursor: "pointer", fontWeight: "600", fontSize: "13px", background: "white", color: C.muted }}
          >
            🗑 Effacer
          </button>
        )}
      </div>

      {/* Zone transcription */}
      <textarea
        placeholder="La transcription apparaîtra ici en temps réel..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        style={{
          width: "100%", padding: "10px", borderRadius: "8px",
          border: `1px solid ${C.border}`, fontSize: "13px",
          color: C.text, background: "white", boxSizing: "border-box",
          resize: "vertical", lineHeight: "1.5",
        }}
      />

      {/* Mots-clés extraits */}
      {keywords.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", marginBottom: "6px", fontWeight: "600" }}>
            🔑 Mots-clés détectés
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {keywords.map(kw => (
              <span key={kw} style={{ background: "#e8eef5", color: C.g4, padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {!formId && notes.trim() && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#d97706", fontWeight: "500" }}>
          ⚠️ Soumets le formulaire pour pouvoir lier et sauvegarder cet audio.
        </p>
      )}
    </div>
  );
}
