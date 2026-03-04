import { useState, useRef } from "react";

// Déclaration globale pour TS (SpeechRecognition n'existe pas dans lib.dom.d.ts)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Props attendues
interface AudioRecorderProps {
  notes: string;
  setNotes: (value: string) => void;
}

/**
 * Composant AudioRecorder
 * -----------------------
 * - Démarre / arrête la reconnaissance vocale
 * - Transcrit la voix en texte
 * - Injecte le texte directement dans `notes`
 */
export default function AudioRecorder({ notes, setNotes }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Démarre l'enregistrement
  const startRecording = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("🚫 Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;     // Écoute continue
    recognition.interimResults = true; // Transcription en temps réel
    recognition.lang = "fr-FR";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNotes(transcript); // Injection directe dans le formulaire
    };

    recognition.onerror = (event: any) => {
      console.error("Erreur reconnaissance vocale :", event.error);
      alert("Erreur reconnaissance vocale : " + event.error);
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  // Arrête l'enregistrement
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      {/* Bouton toggle enregistrement */}
      <button
        onClick={recording ? stopRecording : startRecording}
        style={{ padding: "6px 12px" }}
      >
        {recording ? "⏹️ Arrêter l'enregistrement" : "🔴 Démarrer l'enregistrement"}
      </button>

      {/* Zone texte pour transcription */}
      <textarea
        id="notes"
        name="notes"
        placeholder="Le texte retranscrit apparaîtra ici..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "10px",
        }}
      />
    </div>
  );
}
