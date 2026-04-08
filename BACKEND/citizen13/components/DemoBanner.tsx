"use client";
import { useEffect, useState } from "react";

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  
  useEffect(() => {
    const demo = !!localStorage.getItem("demo_mode");
    setIsDemo(demo);
    if (demo) {
      document.body.style.paddingTop = "32px"; // ← AJOUT
    }
    return () => {
      document.body.style.paddingTop = ""; // ← nettoyage
    };
  }, []);

  if (!isDemo) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", background: "#1a6b2e", color: "white", padding: "7px", textAlign: "center", fontSize: "0.8rem", zIndex: 99999 }}>
      Mode démo — données fictives &nbsp;|&nbsp;
      <a href="/login" onClick={() => localStorage.clear()} style={{ fontWeight: "bold", color: "white", marginLeft: "6px" }}>
        Se connecter
      </a>
    </div>
  );
}