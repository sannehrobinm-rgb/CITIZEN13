import { useState } from "react";

type AgentLoginProps = {
  onLogin: (name: string) => void;
};

export default function AgentLogin({ onLogin }: AgentLoginProps) {
  const [name, setName] = useState("");

  const handleLogin = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  };

  return (
    <div>
      <label htmlFor="agentName">Nom du bénévole</label>

      <input
        id="agentName"
        type="text"
        placeholder="Nom du bénévole"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button onClick={handleLogin} disabled={!name.trim()}>
        Se connecter
      </button>
    </div>
  );
}