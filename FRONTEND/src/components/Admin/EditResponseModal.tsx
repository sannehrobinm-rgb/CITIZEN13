import React, { useState, useEffect } from "react";

interface EditResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (updatedData: any) => void;
}

export default function EditResponseModal({
  isOpen,
  onClose,
  data,
  onSave,
}: EditResponseModalProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev: any) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "10px", fontSize: "18px" }}>✏️ Modifier la réponse #{formData.id}</h2>

        <div style={scrollStyle}>

          {/* ── BÉNÉVOLE ── */}
          <Section title="👤 Bénévole">
            <Field label="Nom bénévole">
              <input name="nom_benevole" value={formData.nom_benevole || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Date visite">
              <input name="date_visite" value={formData.date_visite || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Heure visite">
              <input name="heure_visite" value={formData.heure_visite || ""} onChange={handleChange} style={inputStyle} />
            </Field>
          </Section>

          {/* ── ADRESSE ── */}
          <Section title="🏠 Adresse">
            <Field label="Adresse">
              <input name="adresse" value={formData.adresse || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Quartier">
              <input name="quartier" value={formData.quartier || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Étage">
              <input name="etage" value={formData.etage || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Appartement">
              <input name="appartement" value={formData.appartement || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Bâtiment numéro">
              <input name="batiment_numero" value={formData.batiment_numero || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <CheckField label="Bâtiment" name="batiment" checked={!!formData.batiment} onChange={handleChange} />
              <CheckField label="Immeuble" name="immeuble" checked={!!formData.immeuble} onChange={handleChange} />
              <CheckField label="Maison" name="maison" checked={!!formData.maison} onChange={handleChange} />
            </div>
          </Section>

          {/* ── VOTE ── */}
          <Section title="🗳️ Vote">
            <Field label="Inscrit listes">
              <select name="inscrit_listes" value={formData.inscrit_listes || ""} onChange={handleChange} style={inputStyle}>
                <option value="">--</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
                <option value="Ne sait pas">Ne sait pas</option>
              </select>
            </Field>
            <Field label="Intention de vote">
              <select name="intention_vote" value={formData.intention_vote || ""} onChange={handleChange} style={inputStyle}>
                <option value="">--</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
                <option value="Indécis">Indécis</option>
              </select>
            </Field>
            <CheckField label="Aide procuration" name="aide_procuration" checked={!!formData.aide_procuration} onChange={handleChange} />
            <Field label="Raison autre texte">
              <input name="raison_autre_texte" value={formData.raison_autre_texte || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Info municipales">
              <input name="info_municipales" value={formData.info_municipales || ""} onChange={handleChange} style={inputStyle} />
            </Field>
          </Section>

          {/* ── ENGAGEMENT ── */}
          <Section title="💬 Engagement">
            <Field label="Préoccupations">
              <textarea name="preoccupations_texte" value={formData.preoccupations_texte || ""} onChange={handleChange} style={{ ...inputStyle, height: "60px" }} />
            </Field>
            <Field label="Propositions">
              <textarea name="propositions_texte" value={formData.propositions_texte || ""} onChange={handleChange} style={{ ...inputStyle, height: "60px" }} />
            </Field>
            <Field label="Soutien association">
              <input name="soutien_assoc" value={formData.soutien_assoc || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <CheckField label="Souhait don" name="souhait_don" checked={!!formData.souhait_don} onChange={handleChange} />
            <CheckField label="Contact accord" name="contact_accord" checked={!!formData.contact_accord} onChange={handleChange} />
          </Section>

          {/* ── CONTACT ── */}
          <Section title="📞 Contact">
            <Field label="Nom">
              <input name="nom" value={formData.nom || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Prénom">
              <input name="prenom" value={formData.prenom || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Email">
              <input name="email" value={formData.email || ""} onChange={handleChange} style={inputStyle} />
            </Field>
            <Field label="Téléphone">
              <input name="telephone" value={formData.telephone || ""} onChange={handleChange} style={inputStyle} />
            </Field>
          </Section>

        </div>

        {/* ── BOUTONS ── */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button onClick={handleSubmit} style={btnSaveStyle}>✅ Sauvegarder</button>
          <button onClick={onClose} style={btnCancelStyle}>❌ Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ── Composants utilitaires ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#555" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <label style={{ fontSize: "12px", color: "#777" }}>{label}</label>
      {children}
    </div>
  );
}

function CheckField({ label, name, checked, onChange }: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

// ── Styles ──
const backdropStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  backgroundColor: "white", padding: "20px", borderRadius: "10px",
  width: "520px", maxWidth: "95vw", maxHeight: "90vh",
  display: "flex", flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
};
const scrollStyle: React.CSSProperties = {
  overflowY: "auto", flex: 1, paddingRight: "5px",
};
const inputStyle: React.CSSProperties = {
  padding: "6px 8px", border: "1px solid #ddd",
  borderRadius: "4px", fontSize: "13px", width: "100%",
};
const btnSaveStyle: React.CSSProperties = {
  flex: 1, padding: "8px", backgroundColor: "#4CAF50",
  color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold",
};
const btnCancelStyle: React.CSSProperties = {
  flex: 1, padding: "8px", backgroundColor: "#f44336",
  color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold",
};