import { useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  g1: "#1a6b2e", g3: "#1a7a6b", g4: "#1a3a6b",
  border: "#d9e8e0", muted: "#555555", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Remplis tous les champs."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) { setError("Email ou mot de passe incorrect."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", data.user?.nom ?? "");
      if (data.role === "admin" || data.role === "superviseur") {
        navigate("/admin");
      } else {
        navigate("/visit", { state: { agent: data.user?.nom } });
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", padding: "11px 14px",
    border: `1.5px solid ${C.border}`, borderRadius: "10px",
    fontSize: "14px", marginTop: "5px", boxSizing: "border-box", color: "#111", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: "700", color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.4px",
  };

  return (
    <div style={{ minHeight: "100vh", background: GRADIENT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: "16px" }}>

      {/* Card */}
      <div style={{ background: C.white, borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

        {/* Logo + titre */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "64px", marginBottom: "14px" }}
            onError={e => { e.currentTarget.style.display = "none"; }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "0 0 4px" }}>Connexion</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Accès réservé aux membres Citizen13</p>
        </div>

        {/* Formulaire */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="votre@email.fr" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••" style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: "#fdecea", color: "#b71c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ padding: "13px", background: loading ? "#aaa" : GRADIENT, color: "white", border: "none", borderRadius: "10px", cursor: loading ? "wait" : "pointer", fontWeight: "700", fontSize: "15px", marginTop: "4px", boxShadow: "0 4px 14px rgba(26,107,46,0.3)", transition: "opacity 0.2s" }}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#bbb" }}>
          Citizen13 · 13ème arrondissement de Paris
        </p>
      </div>
    </div>
  );
}
