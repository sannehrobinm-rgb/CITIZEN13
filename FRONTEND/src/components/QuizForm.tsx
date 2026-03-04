import { useState } from "react";

// -------------------- Typage TypeScript --------------------
interface QuizFormData {
  // Écran 1
  date_visite: string;
  heure_visite: string;
  nom_benevole: string;
  adresse: string;
  quartier: string;
  batiment: boolean;
  immeuble: boolean;
  etage: string;
  appartement: string;
  maison: boolean;
  batiment_numero: string;

  // Écran 2
  inscrit_listes: string;
  intention_vote: string;
  aide_procuration: boolean;

  // Écran 3
  raisons_non_vote: string[];
  raison_autre_texte: string;
  info_municipales: string;

  // Écran 4
  interets: string[];
  preoccupations_texte: string;

  // Écran 5
  themes_importants: string[];
  propositions_texte: string;

  // Écran 6
  souhait_suivi: string[];
  contact_accord: boolean;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  soutien_assoc: string;
  souhait_don: boolean;
}

interface QuizFormProps {
  agentName?: string;
  notes?: string;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

// -------------------- Composant --------------------
export default function QuizForm({ agentName }: QuizFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<QuizFormData>({
    date_visite: new Date().toLocaleDateString(),
    heure_visite: new Date().toLocaleTimeString(),
    nom_benevole: agentName || "",
    adresse: "",
    quartier: "",
    batiment: false,
    immeuble: false,
    etage: "",
    appartement: "",
    maison: false,
    batiment_numero: "",
    inscrit_listes: "",
    intention_vote: "",
    aide_procuration: false,
    raisons_non_vote: [],
    raison_autre_texte: "",
    info_municipales: "",
    interets: [],
    preoccupations_texte: "",
    themes_importants: [],
    propositions_texte: "",
    souhait_suivi: [],
    contact_accord: false,
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    soutien_assoc: "",
    souhait_don: false,
  });

  // -------------------- Styles --------------------
  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
    width: "100%",
    cursor: "pointer",
    gap: "10px",
  };

  const inputStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    appearance: "none",
    border: "2px solid #333",
    borderRadius: "3px",
    cursor: "pointer",
    display: "inline-block",
  };

  const checkedStyle: React.CSSProperties = {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  };

  const textInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
    boxSizing: "border-box",
  };

  // -------------------- Fonctions utilitaires --------------------
  const toggleMulti = (field: keyof QuizFormData, value: string) => {
    setForm((prev) => {
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const canGoNext = () => {
    if (!form.nom_benevole || !form.adresse || !form.quartier) return false;
    if (!form.maison && !form.batiment && !form.immeuble) return true;
    if ((form.batiment || form.immeuble) && !form.etage && !form.appartement && !form.batiment_numero)
      return false;
    return true;
  };

  const onBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5005/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Réponse non JSON reçue :", text);
        throw new Error("Le serveur n’a pas renvoyé du JSON");
      }

      const data = await response.json();

      if (data.success) {
        alert("Formulaire envoyé et sauvegardé !");
        window.location.reload();
      } else {
        alert("Erreur lors de l'envoi du formulaire.");
      }
    } catch (error) {
      console.error("Erreur lors de l’envoi :", error);
      alert("Erreur réseau ou serveur.");
    }
  };

  // -------------------- Rendu --------------------
  return (
    <div>
      {/* Étape 1 */}
      {step === 1 && (
        <div>
          <h3><u>Contexte de la visite</u></h3>
          <input
            placeholder="Nom du bénévole"
            value={form.nom_benevole}
            onChange={(e) => setForm({ ...form, nom_benevole: e.target.value })}
            style={textInputStyle}
          />
          <input
            placeholder="Adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            style={textInputStyle}
          />
          <input
            placeholder="Quartier"
            value={form.quartier}
            onChange={(e) => setForm({ ...form, quartier: e.target.value })}
            style={textInputStyle}
          />

          <label style={wrapperStyle}>
            <span>Maison</span>
            <input
              type="checkbox"
              checked={form.maison}
              onChange={(e) => setForm({ ...form, maison: e.target.checked })}
              style={{ ...inputStyle, ...(form.maison ? checkedStyle : {}) }}
            />
          </label>

          <label style={wrapperStyle}>
            <span>Immeuble</span>
            <input
              type="checkbox"
              checked={form.immeuble}
              onChange={(e) => setForm({ ...form, immeuble: e.target.checked })}
              style={{ ...inputStyle, ...(form.immeuble ? checkedStyle : {}) }}
            />
          </label>

          <label style={wrapperStyle}>
            <span>Bâtiment</span>
            <input
              type="checkbox"
              checked={form.batiment}
              onChange={(e) => setForm({ ...form, batiment: e.target.checked })}
              style={{ ...inputStyle, ...(form.batiment ? checkedStyle : {}) }}
            />
          </label>

          {(form.immeuble || form.batiment) && (
            <>
              <input
                placeholder="Étage"
                value={form.etage}
                onChange={(e) => setForm({ ...form, etage: e.target.value })}
                style={textInputStyle}
              />
              <input
                placeholder="Appartement numero ou indication"
                value={form.appartement}
                onChange={(e) => setForm({ ...form, appartement: e.target.value })}
                style={textInputStyle}
              />
            </>
          )}

          {form.batiment && (
            <input
              placeholder="Numéro/Lettre du Batiment"
              value={form.batiment_numero}
              onChange={(e) => setForm({ ...form, batiment_numero: e.target.value })}
              style={textInputStyle}
            />
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={() => canGoNext() ? setStep(2) : alert("Merci de remplir le contexte de visite.")}>Questionnaire</button>
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div>
          <h3>Inscription & participation électorale</h3>
          <p><u>Êtes-vous inscrit(e) sur les listes électorales ?</u></p>
          {["Oui", "Non", "Je ne sais pas"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="radio"
                name="inscrit_listes"
                checked={form.inscrit_listes === o}
                onChange={() => setForm({ ...form, inscrit_listes: o })}
                style={{ ...inputStyle, ...(form.inscrit_listes === o ? checkedStyle : {}) }}
              />
            </label>
          ))}

          <p><u>Allez-vous voter aux prochaines élections municipales ?</u></p>
          {["Oui", "Oui, par procuration", "Non", "J’hésite"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="radio"
                name="intention_vote"
                checked={form.intention_vote === o}
                onChange={() => setForm({ ...form, intention_vote: o })}
                style={{ ...inputStyle, ...(form.intention_vote === o ? checkedStyle : {}) }}
              />
            </label>
          ))}

          {form.intention_vote === "Oui, par procuration" && (
            <label style={wrapperStyle}>
              <span>Besoin d’aide pour la procuration</span>
              <input
                type="checkbox"
                checked={form.aide_procuration}
                onChange={(e) => setForm({ ...form, aide_procuration: e.target.checked })}
                style={{ ...inputStyle, ...(form.aide_procuration ? checkedStyle : {}) }}
              />
            </label>
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={() => setStep(3)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div>
          <h3>Freins & informations</h3>
          <p><u>Qu’est-ce qui vous freine le plus ?</u></p>
          {["Manque d’intérêt","Déception politique","Impression que ça ne sert à rien","Manque d’informations","Autre"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="checkbox"
                checked={form.raisons_non_vote.includes(o)}
                onChange={() => toggleMulti("raisons_non_vote", o)}
                style={{ ...inputStyle, ...(form.raisons_non_vote.includes(o) ? checkedStyle : {}) }}
              />
            </label>
          ))}
          {form.raisons_non_vote.includes("Autre") && (
            <input
              placeholder="Précisez autre raison"
              value={form.raison_autre_texte}
              onChange={(e) => setForm({ ...form, raison_autre_texte: e.target.value })}
              style={textInputStyle}
            />
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={() => setStep(4)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 4 */}
      {step === 4 && (
        <div>
          <h3>Centres d'intérêt et préoccupations</h3>
          <p><u>Quelles sont vos préoccupations principales ?</u></p>
          {["Sécurité","Environnement","Transports","Éducation","Santé"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="checkbox"
                checked={form.interets.includes(o)}
                onChange={() => toggleMulti("interets", o)}
                style={{ ...inputStyle, ...(form.interets.includes(o) ? checkedStyle : {}) }}
              />
            </label>
          ))}
          <textarea
            placeholder="Autres préoccupations"
            value={form.preoccupations_texte}
            onChange={e => setForm({ ...form, preoccupations_texte: e.target.value })}
            style={textInputStyle}
          />

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={() => setStep(5)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 5 */}
      {step === 5 && (
        <div>
          <h3>Thèmes importants et propositions</h3>
          {["Logement","Santé","Emploi","Éducation","Culture"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="checkbox"
                checked={form.themes_importants.includes(o)}
                onChange={() => toggleMulti("themes_importants", o)}
                style={{ ...inputStyle, ...(form.themes_importants.includes(o) ? checkedStyle : {}) }}
              />
            </label>
          ))}
          <textarea
            placeholder="Vos propositions"
            value={form.propositions_texte}
            onChange={e => setForm({ ...form, propositions_texte: e.target.value })}
            style={textInputStyle}
          />

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={() => setStep(6)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 6 */}
      {step === 6 && (
        <div>
          <h3>Suivi & soutien</h3>
          {["Oui par mail", "Oui par téléphone", "Non"].map((o) => (
            <label key={o} style={wrapperStyle}>
              <span>{o}</span>
              <input
                type="checkbox"
                checked={form.souhait_suivi.includes(o)}
                onChange={() => toggleMulti("souhait_suivi", o)}
                style={{ ...inputStyle, ...(form.souhait_suivi.includes(o) ? checkedStyle : {}) }}
              />
            </label>
          ))}

          <label style={wrapperStyle}>
            <span>Consentement au contact</span>
            <input
              type="checkbox"
              checked={form.contact_accord}
              onChange={(e) => setForm({ ...form, contact_accord: e.target.checked })}
              style={{ ...inputStyle, ...(form.contact_accord ? checkedStyle : {}) }}
            />
          </label>

          {form.contact_accord && (
            <div>
              <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={textInputStyle} />
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={textInputStyle} />
              <input placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} style={textInputStyle} />
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={textInputStyle} />
            </div>
          )}

          <label style={wrapperStyle}>
            <span>Souhaitez-vous soutenir l’association financièrement ?</span>
            <input
              type="checkbox"
              checked={form.souhait_don}
              onChange={e => setForm({ ...form, souhait_don: e.target.checked })}
              style={{ ...inputStyle, ...(form.souhait_don ? checkedStyle : {}) }}
            />
          </label>

          <textarea
            placeholder="Souhait de soutien (bénévolat, idées, etc.)"
            value={form.soutien_assoc}
            onChange={e => setForm({ ...form, soutien_assoc: e.target.value })}
            style={textInputStyle}
          />

          <div style={{ marginTop: "10px" }}>
            <button onClick={onBack}>Retour ←</button>
            <button onClick={handleSubmit}>Envoyer le formulaire</button>
          </div>
        </div>
      )}
    </div>
  );
}
