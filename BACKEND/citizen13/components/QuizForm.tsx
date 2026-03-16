"use client";
// components/QuizForm.tsx
import { useState } from "react";

const C = {
  g1: "#1a6b2e", g2: "#2d8a4e", g3: "#1a7a6b", g4: "#1a3a6b",
  light: "#f0f7f4", text: "#111111", muted: "#555555", border: "#d9e8e0", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const TOTAL_STEPS = 6;

interface QuizFormData {
  date_visite: string; heure_visite: string; nom_benevole: string;
  adresse: string; quartier: string; batiment: boolean; immeuble: boolean;
  etage: string; appartement: string; maison: boolean; batiment_numero: string;
  inscrit_listes: string; intention_vote: string; aide_procuration: boolean;
  raisons_non_vote: string[]; raison_autre_texte: string; info_municipales: string;
  interets: string[]; preoccupations_texte: string;
  themes_importants: string[]; propositions_texte: string;
  souhait_suivi: string[]; contact_accord: boolean;
  nom: string; prenom: string; telephone: string; email: string;
  soutien_assoc: string; souhait_don: boolean;
}

interface QuizFormProps {
  agentName?: string;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const QUARTIERS_13 = ["Austerlitz","Butte-aux-Cailles","Croulebarbe","Gare","Glacière","Gobelins","Maison-Blanche","Olympiades","Périchaux","Place d'Italie","Tolbiac","BnF","Jeanne d'Arc","Autre"];

export default function QuizForm({ agentName, onBack, onSubmit }: QuizFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<QuizFormData>({
    date_visite: new Date().toLocaleDateString("fr-FR"),
    heure_visite: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    nom_benevole: agentName || "",
    adresse: "", quartier: "", batiment: false, immeuble: false,
    etage: "", appartement: "", maison: false, batiment_numero: "",
    inscrit_listes: "", intention_vote: "", aide_procuration: false,
    raisons_non_vote: [], raison_autre_texte: "", info_municipales: "",
    interets: [], preoccupations_texte: "",
    themes_importants: [], propositions_texte: "",
    souhait_suivi: [], contact_accord: false,
    nom: "", prenom: "", telephone: "", email: "",
    soutien_assoc: "", souhait_don: false,
  });

  const toggleMulti = (field: keyof QuizFormData, value: string) => {
    setForm(prev => {
      const current = prev[field] as string[];
      return { ...prev, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const canGoNext = () => {
    if (step === 1) {
      if (!form.nom_benevole || !form.adresse || !form.quartier) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      onSubmit({ ...form, id: data?.id });
    } catch {
      alert("Erreur réseau ou serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const card: React.CSSProperties = { background: C.white, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}`, marginBottom: "10px" };
  const input: React.CSSProperties = { width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "14px", color: C.text, boxSizing: "border-box", background: C.white, outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "5px" };

  const RadioCard = ({ value, current, field, label }: { value: string; current: string; field: keyof QuizFormData; label: string }) => (
    <button onClick={() => setForm({ ...form, [field]: value })}
      style={{ width: "100%", padding: "12px 16px", border: `2px solid ${current === value ? C.g1 : C.border}`, borderRadius: "10px", background: current === value ? "#e8f5ee" : C.white, color: current === value ? C.g1 : C.text, fontWeight: current === value ? "700" : "500", fontSize: "14px", cursor: "pointer", textAlign: "left", marginBottom: "8px", transition: "all 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {label}
      {current === value && <span style={{ fontSize: "16px" }}>✓</span>}
    </button>
  );

  const CheckCard = ({ checked, onChange, label }: { value: string; checked: boolean; onChange: () => void; label: string }) => (
    <button onClick={onChange}
      style={{ width: "100%", padding: "12px 16px", border: `2px solid ${checked ? C.g1 : C.border}`, borderRadius: "10px", background: checked ? "#e8f5ee" : C.white, color: checked ? C.g1 : C.text, fontWeight: checked ? "700" : "500", fontSize: "14px", cursor: "pointer", textAlign: "left", marginBottom: "8px", transition: "all 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {label}
      <span style={{ fontSize: "16px", opacity: checked ? 1 : 0.3 }}>✓</span>
    </button>
  );

  const stepTitles = ["Contexte de la visite", "Participation électorale", "Freins & informations", "Préoccupations", "Thèmes & propositions", "Suivi & soutien"];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Barre de progression */}
      <div style={{ background: C.white, borderRadius: "12px", padding: "16px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{stepTitles[step - 1]}</span>
          <span style={{ fontSize: "12px", color: C.muted, fontWeight: "600" }}>Étape {step}/{TOTAL_STEPS}</span>
        </div>
        <div style={{ background: C.light, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
          <div style={{ width: `${(step / TOTAL_STEPS) * 100}%`, height: "100%", background: GRADIENT, borderRadius: "4px", transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i < step ? C.g1 : C.border, transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Étape 1 */}
      {step === 1 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Bénévole</span>
            <input style={input} placeholder="Votre nom" value={form.nom_benevole} onChange={e => setForm({ ...form, nom_benevole: e.target.value })} />
          </div>
          <div style={card}>
            <span style={labelStyle}>Adresse visitée *</span>
            <input style={{ ...input, marginBottom: "10px" }} placeholder="Numéro et rue" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
            <span style={labelStyle}>Quartier *</span>
            <select style={input} value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {QUARTIERS_13.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div style={card}>
            <span style={labelStyle}>Type de logement</span>
            {(["maison", "immeuble", "batiment"] as const).map((field) => (
              <CheckCard key={field} value={field} checked={(form as any)[field]} onChange={() => setForm({ ...form, [field]: !(form as any)[field] })} label={field === "maison" ? "🏠 Maison" : field === "immeuble" ? "🏢 Immeuble" : "🏗 Bâtiment"} />
            ))}
            {(form.immeuble || form.batiment) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                <div><span style={labelStyle}>Étage</span><input style={input} placeholder="Ex: 3" value={form.etage} onChange={e => setForm({ ...form, etage: e.target.value })} /></div>
                <div><span style={labelStyle}>Appartement</span><input style={input} placeholder="Ex: 12B" value={form.appartement} onChange={e => setForm({ ...form, appartement: e.target.value })} /></div>
              </div>
            )}
            {form.batiment && (
              <div style={{ marginTop: "8px" }}>
                <span style={labelStyle}>Numéro du bâtiment</span>
                <input style={input} placeholder="Ex: Bât. A" value={form.batiment_numero} onChange={e => setForm({ ...form, batiment_numero: e.target.value })} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Inscrit(e) sur les listes électorales ?</span>
            {["Oui", "Non", "Je ne sais pas"].map(o => <RadioCard key={o} value={o} current={form.inscrit_listes} field="inscrit_listes" label={o} />)}
          </div>
          <div style={card}>
            <span style={labelStyle}>Intention de vote aux municipales ?</span>
            {["Oui", "Oui, par procuration", "Non", "J'hésite"].map(o => <RadioCard key={o} value={o} current={form.intention_vote} field="intention_vote" label={o} />)}
            {form.intention_vote === "Oui, par procuration" && (
              <CheckCard value="aide" checked={form.aide_procuration} onChange={() => setForm({ ...form, aide_procuration: !form.aide_procuration })} label="🤝 Besoin d'aide pour la procuration" />
            )}
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Qu'est-ce qui vous freine le plus ?</span>
            {["Manque d'intérêt", "Déception politique", "Impression que ça ne sert à rien", "Manque d'informations", "Autre"].map(o => (
              <CheckCard key={o} value={o} checked={form.raisons_non_vote.includes(o)} onChange={() => toggleMulti("raisons_non_vote", o)} label={o} />
            ))}
            {form.raisons_non_vote.includes("Autre") && (
              <div style={{ marginTop: "8px" }}>
                <span style={labelStyle}>Précisez</span>
                <input style={input} placeholder="Autre raison..." value={form.raison_autre_texte} onChange={e => setForm({ ...form, raison_autre_texte: e.target.value })} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Étape 4 */}
      {step === 4 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Préoccupations principales</span>
            {["Sécurité", "Environnement", "Transports", "Éducation", "Santé", "Logement", "Emploi"].map(o => (
              <CheckCard key={o} value={o} checked={form.interets.includes(o)} onChange={() => toggleMulti("interets", o)} label={o} />
            ))}
            <div style={{ marginTop: "8px" }}>
              <span style={labelStyle}>Autres préoccupations</span>
              <textarea style={{ ...input, resize: "vertical", minHeight: "80px" }} placeholder="Précisez si besoin..."
                value={form.preoccupations_texte} onChange={e => setForm({ ...form, preoccupations_texte: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Étape 5 */}
      {step === 5 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Thèmes les plus importants</span>
            {["Logement", "Santé", "Emploi", "Éducation", "Culture", "Sécurité", "Environnement"].map(o => (
              <CheckCard key={o} value={o} checked={form.themes_importants.includes(o)} onChange={() => toggleMulti("themes_importants", o)} label={o} />
            ))}
            <div style={{ marginTop: "8px" }}>
              <span style={labelStyle}>Vos propositions</span>
              <textarea style={{ ...input, resize: "vertical", minHeight: "80px" }} placeholder="Idées, suggestions..."
                value={form.propositions_texte} onChange={e => setForm({ ...form, propositions_texte: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Étape 6 */}
      {step === 6 && (
        <div>
          <div style={card}>
            <span style={labelStyle}>Souhait de suivi</span>
            {["Oui par mail", "Oui par téléphone", "Non"].map(o => (
              <CheckCard key={o} value={o} checked={form.souhait_suivi.includes(o)} onChange={() => toggleMulti("souhait_suivi", o)} label={o} />
            ))}
          </div>
          <div style={card}>
            <CheckCard value="accord" checked={form.contact_accord} onChange={() => setForm({ ...form, contact_accord: !form.contact_accord })} label="✅ Consentement au contact" />
            {form.contact_accord && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                {(["nom", "prenom", "telephone", "email"] as const).map((field) => (
                  <div key={field}>
                    <span style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                    <input style={input} placeholder={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={card}>
            <CheckCard value="don" checked={form.souhait_don} onChange={() => setForm({ ...form, souhait_don: !form.souhait_don })} label="💛 Souhait de soutien financier" />
            <div style={{ marginTop: "8px" }}>
              <span style={labelStyle}>Autres formes de soutien</span>
              <textarea style={{ ...input, resize: "vertical", minHeight: "70px" }} placeholder="Bénévolat, idées..."
                value={form.soutien_assoc} onChange={e => setForm({ ...form, soutien_assoc: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingBottom: "24px" }}>
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)}
          style={{ flex: 1, padding: "13px", border: `2px solid ${C.border}`, borderRadius: "10px", background: C.white, color: C.text, fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
          ← Retour
        </button>
        {step < TOTAL_STEPS ? (
          <button onClick={() => canGoNext() ? setStep(step + 1) : alert("Merci de renseigner les champs obligatoires (*).")}
            style={{ flex: 2, padding: "13px", border: "none", borderRadius: "10px", background: GRADIENT, color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 3px 10px rgba(26,107,46,0.3)" }}>
            Suivant →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            style={{ flex: 2, padding: "13px", border: "none", borderRadius: "10px", background: submitting ? "#aaa" : GRADIENT, color: "white", fontWeight: "700", fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(26,107,46,0.3)" }}>
            {submitting ? "Envoi en cours..." : "✅ Envoyer le formulaire"}
          </button>
        )}
      </div>
    </div>
  );
}
