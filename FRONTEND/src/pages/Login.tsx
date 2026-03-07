import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GRADIENT = "linear-gradient(135deg, #1a6b2e 0%, #1a7a6b 50%, #1a3a6b 100%)";

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
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.role === "admin" || data.role === "superviseur") {
        navigate("/admin");
      } else {
        navigate("/visit", { state: { agent: data.user.nom } });
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "60px", marginBottom: "12px" }} />
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: 0 }}>Connexion</h1>
          <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>Accès réservé aux membres Citizen13</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="admin@citizen13.fr"
              style={{ display: "block", width: "100%", padding: "10px 14px", border: "1px solid #d9e8e0", borderRadius: "8px", fontSize: "14px", marginTop: "4px", boxSizing: "border-box", color: "#111" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
              style={{ display: "block", width: "100%", padding: "10px 14px", border: "1px solid #d9e8e0", borderRadius: "8px", fontSize: "14px", marginTop: "4px", boxSizing: "border-box", color: "#111" }} />
          </div>
          {error && <div style={{ background: "#fdecea", color: "#b71c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>⚠️ {error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ padding: "12px", background: GRADIENT, color: "white", border: "none", borderRadius: "8px", cursor: loading ? "wait" : "pointer", fontWeight: "700", fontSize: "15px" }}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#aaa" }}>Citizen13 — Dashboard Administrateur</p>
      </div>
    </div>
  );
}