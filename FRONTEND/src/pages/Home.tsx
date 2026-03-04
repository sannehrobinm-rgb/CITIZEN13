// Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentLogin from "../components/AgentLogin.tsx";

export default function Home() {
  const navigate = useNavigate();

  // État local de l'agent
  const [agent, setAgent] = useState(null);

  // Petit guide (si besoin plus tard)
  //const [openGuide, setOpenGuide] = useState(false);

  // Aller à la page visite
  const goToVisit = () => {
    if (!agent) {
      alert("Veuillez d'abord saisir votre nom d'agent !");
      return;
    }
    navigate("/visit", { state: { agent } });
  };

  // Aller au tableau de bord Admin
  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "10px" }}>
      {/* ================== Connexion ================== */}
      {!agent ? (
        <>
          <h2>Identification de l’agent</h2>
          <AgentLogin onLogin={setAgent} />
        </>
      ) : (
        <>
          {/* Bouton déconnexion */}
          <button onClick={() => setAgent(null)}>← Déconnexion</button>

          {/* Message de bienvenue */}
          <h2>Bienvenue {agent}</h2>

          {/* Navigation */}
          <div style={{ marginTop: "10px" }}>
            <button onClick={goToVisit}>➜ Aller à la visite</button>
            <button onClick={goToAdmin} style={{ marginLeft: "10px" }}>
              Admin
            </button>
          </div>
        </>
      )}
    </div>
  );
}
