import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizForm from "../components/QuizForm";
import AudioRecorder from "../components/AudioRecorder";

type VisitFormData = {
  nom_benevole: string;
  adresse: string;
  quartier: string;
  batiment?: boolean;
  immeuble?: boolean;
  notes?: string;
  id?: number; // id retourné par l'API après soumission
};

export default function Visit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent } = location.state || {};

  const [showAudio, setShowAudio] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [formsSent, setFormsSent] = useState<VisitFormData[]>([]);
  const [notes, setNotes] = useState("");
  const [lastFormId, setLastFormId] = useState<number | null>(null); // ← ID du dernier formulaire soumis

  const handleFormSubmit = (formData: any) => {
    console.log("Données formulaire : ", formData);
    setFormsSent((prev) => [...prev, formData]);

    // Récupère l'id retourné par l'API si disponible
    if (formData?.id) {
      setLastFormId(formData.id);
    }

    alert("Formulaire envoyé avec succès !");
    setShowQuestionnaire(false);
  };

  const handleNewVisit = () => {
    setNotes("");
    setLastFormId(null);
    setShowQuestionnaire(false);
    setShowAudio(false);
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "10px" }}>
      <div style={{ maxWidth: "70px", marginBottom: "15px" }}>
        <button onClick={() => navigate(-1)} style={{ padding: "0", fontSize: "16px" }}>
          ← Retour
        </button>
      </div>

      {/* Mode Audio */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowAudio(!showAudio)} style={{ marginRight: "10px" }}>
          {showAudio ? "Fermer Mode Audio" : "🎙️ Ouvrir Mode Audio"}
        </button>
        {showAudio && (
          <AudioRecorder
            notes={notes}
            setNotes={setNotes}
            formId={lastFormId} // ← lien avec le formulaire soumis
          />
        )}
      </div>

      {/* Questionnaire */}
      <button
        onClick={() => setShowQuestionnaire((prev) => !prev)}
        style={{ marginBottom: "15px" }}
      >
        Questionnaire
      </button>

      {showQuestionnaire && (
        <QuizForm
          agentName={agent || ""}
          onBack={() => setShowQuestionnaire(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Formulaires envoyés */}
      {formsSent.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Formulaires envoyés</h4>
          <ul>
            {formsSent.map((f: any, i: number) => (
              <li key={i}>
                {f.nom_benevole} - {f.adresse} / {f.quartier}{" "}
                {f.batiment ? "Bâtiment" : ""} {f.immeuble ? "Immeuble" : ""}
                {f.id && <span style={{ color: "#888", fontSize: "12px" }}> (ID #{f.id})</span>}
              </li>
            ))}
          </ul>
          <button onClick={handleNewVisit} style={{ marginTop: "10px" }}>
            ➕ Nouvelle visite
          </button>
        </div>
      )}
    </div>
  );
}
