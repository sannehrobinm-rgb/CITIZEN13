export default function ModeSelector({ onChange }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      
      <button
        onClick={() => onChange("audio")}
        style={{ display: "block", width: "100%", marginBottom: "10px" }}
      >
        🎤 Mode audio
      </button>

      <button
        onClick={() => onChange("quiz")}
        style={{ display: "block", width: "100%" }}
      >
        📝 Questionnaire
      </button>

    </div>
  );
}
