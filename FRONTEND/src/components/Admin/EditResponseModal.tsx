import React, { useState, useEffect } from "react";

// ---------------------------
// Définition des props
// ---------------------------
interface EditResponseModalProps {
  isOpen: boolean;                  // Le modal est ouvert ou non
  onClose: () => void;              // Fonction pour fermer le modal
  data: any;                        // Données de la réponse à éditer
  onSave: (updatedData: any) => void; // Fonction pour sauvegarder
}

// ---------------------------
// Composant modal
// ---------------------------
export default function EditResponseModal({
  isOpen,
  onClose,
  data,
  onSave,
}: EditResponseModalProps) {
  // ---------------------------
  // État du formulaire
  // ---------------------------
  const [formData, setFormData] = useState<any>({});

  // Charger les données existantes quand le modal s'ouvre
  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  // ---------------------------
  // Gestion des changements sur les inputs
  // ---------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ---------------------------
  // Soumission du formulaire
  // ---------------------------
  const handleSubmit = () => {
    onSave(formData); // sauvegarder les modifications
    onClose();        // fermer le modal
  };

  // Si le modal n'est pas ouvert, rien n'est affiché
  if (!isOpen) return null;

  // ---------------------------
  // Rendu
  // ---------------------------
  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-content" style={modalStyle}>
        <h2>Modifier la réponse</h2>

        <label>Nom du bénévole</label>
        <input
          type="text"
          name="nom_benevole"
          value={formData.nom_benevole || ""}
          onChange={handleChange}
        />

        <label>Adresse</label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse || ""}
          onChange={handleChange}
        />

        {/* Ici tu peux ajouter d'autres champs comme email, RIB, etc. */}

        <div style={{ marginTop: "15px" }}>
          <button onClick={handleSubmit} style={btnSaveStyle}>
            Sauvegarder
          </button>
          <button onClick={onClose} style={btnCancelStyle}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Styles simples inline
// ---------------------------
const backdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const btnSaveStyle: React.CSSProperties = {
  marginRight: "10px",
  padding: "5px 10px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const btnCancelStyle: React.CSSProperties = {
  padding: "5px 10px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  cursor: "pointer",
};
