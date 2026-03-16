// ResetPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const C = {
  g1: "#1a6b2e", g3: "#1a7a6b", g4: "#1a3a6b",
  border: "#d9e8e0", muted: "#555555", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const API = "http://localhost:3000";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("Lien invalide ou expiré.");
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirm) { setError("Remplis tous les champs."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur serveur."); return; }
      setSuccess(true);
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
      <div style={{ background: C.white, borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "64px", marginBottom: "14px" }}
            onError={e => { e.currentTarget.style.display = "none"; }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "0 0 4px" }}>Nouveau mot de passe</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: "0 0 8px" }}>Mot de passe modifié !</h2>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px" }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <button onClick={() => navigate("/login")}
              style={{ padding: "12px 24px", background: GRADIENT, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
              → Se connecter
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReset()}
                placeholder="••••••••" style={inputStyle} />
            </div>

            {error && (
              <div style={{ background: "#fdecea", color: "#b71c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleReset} disabled={loading || !token}
              style={{ padding: "13px", background: loading ? "#aaa" : GRADIENT, color: "white", border: "none", borderRadius: "10px", cursor: loading ? "wait" : "pointer", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 14px rgba(26,107,46,0.3)" }}>
              {loading ? "Modification..." : "Modifier le mot de passe →"}
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#bbb" }}>
          Citizen13 · 13ème arrondissement de Paris
        </p>
      </div>
    </div>
  );
}
