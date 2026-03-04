import { useState } from "react";

export default function AgentLogin({ onLogin }) {
  const [name, setName] = useState("");

  const handleLogin = () => {
    if (!name.trim()) return;
    onLogin(name.trim());
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Nom du bénévole"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()} // ✅ Connexion Enter
      />
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
}
