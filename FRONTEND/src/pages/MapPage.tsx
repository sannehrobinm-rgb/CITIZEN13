// MapPage.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const C = {
  g1: "#1a6b2e", g2: "#2d8a4e", g3: "#1a7a6b", g4: "#1a3a6b",
  light: "#f0f7f4", text: "#111111", muted: "#555555", border: "#d9e8e0", white: "#ffffff",
};
const GRADIENT = `linear-gradient(135deg, ${C.g1} 0%, ${C.g3} 50%, ${C.g4} 100%)`;
const API = "http://localhost:3000";

const QUARTIER_COORDS: Record<string, [number, number]> = {
  "Salpêtrière": [48.8394, 2.3567],
  "Gare": [48.8389, 2.3651],
  "Maison-Blanche": [48.8206, 2.3587],
  "Croulebarbe": [48.8336, 2.3505],
  "Butte-aux-Cailles": [48.8313, 2.3517],
  "Place d'Italie": [48.8316, 2.3564],
  "Tolbiac": [48.8264, 2.3615],
  "Olympiades": [48.8274, 2.3668],
  "Château des Rentiers": [48.8333, 2.3620],
  "Ivry": [48.8250, 2.3690],
  "Nationale": [48.8350, 2.3640],
  "Patay": [48.8300, 2.3700],
  "Dunois": [48.8360, 2.3680],
  "Austerlitz": [48.8430, 2.3665],
  "Glacière": [48.8290, 2.3480],
  "Davout": [48.8230, 2.3550],
  "Kellermann": [48.8200, 2.3650],
  "Porte d'Ivry": [48.8210, 2.3720],
  "Porte de Choisy": [48.8190, 2.3640],
  "Masséna": [48.8290, 2.3730],
  "Paris Rive Gauche": [48.8320, 2.3750],
  "Chevaleret": [48.8350, 2.3740],
  "Bibliothèque François-Mitterrand": [48.8338, 2.3775],
  "Périchaux": [48.8260, 2.3540],
  "BnF": [48.8338, 2.3775],
  "Jeanne d'Arc": [48.8310, 2.3670],
  "Gobelins": [48.8340, 2.3530],
};

interface FormResponse {
  id: number;
  nom_benevole?: string;
  quartier?: string;
  adresse?: string;
  intention_vote?: string;
  date_visite?: string;
  inscrit_listes?: string;
  souhait_don?: boolean;
}
interface Boitage {
  id: number; quartier: string; adresse?: string; nb_tracts: number;
  nb_boites: number; nom_benevole?: string; date: string; commentaire?: string;
}
interface Tractage {
  id: number; quartier: string; adresse?: string; nb_tracts: number;
  nb_portes: number; nom_benevole?: string; date: string; commentaire?: string;
}

function getColor(count: number, max: number): string {
  if (max === 0 || count === 0) return "#e8f5ee";
  const ratio = count / max;
  if (ratio > 0.8) return "#1a6b2e";
  if (ratio > 0.6) return "#2d8a4e";
  if (ratio > 0.4) return "#1a7a6b";
  if (ratio > 0.2) return "#4a9a7a";
  return "#a8d5bc";
}

type LayerMode = "visites" | "boitage" | "tractage" | "tous";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function MapPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [boitages, setBoitages] = useState<Boitage[]>([]);
  const [tractages, setTractages] = useState<Tractage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBenevole, setFilterBenevole] = useState("Tous");
  const [filterIntention, setFilterIntention] = useState("Toutes");
  const [selectedQuartier, setSelectedQuartier] = useState<string | null>(null);
  const [layerMode, setLayerMode] = useState<LayerMode>("tous");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/forms/responses`).then(r => r.json()),
      fetch(`${API}/api/boitage`).then(r => r.json()),
      fetch(`${API}/api/tractage`).then(r => r.json()),
    ]).then(([forms, boit, prosp]) => {
      setResponses(Array.isArray(forms) ? forms : []);
      setBoitages(Array.isArray(boit) ? boit : []);
      setTractages(Array.isArray(prosp) ? prosp : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [48.8280, 2.3620],
      zoom: 14,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  }, [panelOpen, selectedQuartier, isMobile]);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    if (layerMode === "visites" || layerMode === "tous") {
      const filtered = responses.filter(r => {
        const matchB = filterBenevole === "Tous" || r.nom_benevole === filterBenevole;
        const matchI = filterIntention === "Toutes" || r.intention_vote === filterIntention;
        return matchB && matchI;
      });
      const counts: Record<string, FormResponse[]> = {};
      filtered.forEach(r => { if (r.quartier) { if (!counts[r.quartier]) counts[r.quartier] = []; counts[r.quartier].push(r); } });
      const max = Math.max(...Object.values(counts).map(v => v.length), 1);
      Object.entries(counts).forEach(([quartier, items]) => {
        const coords = QUARTIER_COORDS[quartier]; if (!coords) return;
        const color = getColor(items.length, max);
        const radius = 120 + (items.length / max) * 280;
        const circle = L.circle(coords, { radius, fillColor: color, fillOpacity: 0.65, color, weight: 2 });
        circle.bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:190px">
            <div style="background:${GRADIENT};color:white;padding:8px 12px;border-radius:6px 6px 0 0;font-weight:700;font-size:14px">📍 ${quartier}</div>
            <div style="padding:10px 12px;background:#f9f9f9;border-radius:0 0 6px 6px">
              <div style="font-size:13px;color:#111;margin-bottom:6px"><b>${items.length}</b> visite${items.length > 1 ? "s" : ""}</div>
              <div style="font-size:12px;color:#555">🗳 Vote Oui : <b>${items.filter(i => i.intention_vote === "Oui").length}</b></div>
              <div style="font-size:12px;color:#555">📝 Inscrits : <b>${items.filter(i => i.inscrit_listes === "Oui").length}</b></div>
              <div style="font-size:12px;color:#555">💛 Dons : <b>${items.filter(i => i.souhait_don).length}</b></div>
            </div>
          </div>`, { maxWidth: 260 });
        circle.on("click", () => setSelectedQuartier(quartier));
        markersRef.current!.addLayer(circle);
        const icon = L.divIcon({
          html: `<div style="background:white;border:2px solid ${color};border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${color};box-shadow:0 1px 4px rgba(0,0,0,0.2)">${items.length}</div>`,
          className: "", iconAnchor: [13, 13],
        });
        L.marker(coords, { icon }).addTo(markersRef.current!);
      });
    }

    if (layerMode === "boitage" || layerMode === "tous") {
      const counts: Record<string, Boitage[]> = {};
      boitages.forEach(b => { if (b.quartier) { if (!counts[b.quartier]) counts[b.quartier] = []; counts[b.quartier].push(b); } });
      Object.entries(counts).forEach(([quartier, items]) => {
        const coords = QUARTIER_COORDS[quartier]; if (!coords) return;
        const offset: [number, number] = [coords[0] + 0.002, coords[1] - 0.002];
        const totalTracts = items.reduce((s, b) => s + b.nb_tracts, 0);
        const totalBoites = items.reduce((s, b) => s + b.nb_boites, 0);
        const icon = L.divIcon({
          html: `<div style="background:#1a3a6b;color:white;border-radius:10px;padding:4px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">📬 ${items.length}</div>`,
          className: "", iconAnchor: [20, 15],
        });
        const marker = L.marker(offset, { icon });
        marker.bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:180px">
            <div style="background:#1a3a6b;color:white;padding:8px 12px;border-radius:6px 6px 0 0;font-weight:700;font-size:14px">📬 Boîtage — ${quartier}</div>
            <div style="padding:10px 12px;background:#f9f9f9;border-radius:0 0 6px 6px">
              <div style="font-size:13px;color:#111;margin-bottom:4px"><b>${items.length}</b> session${items.length > 1 ? "s" : ""}</div>
              <div style="font-size:12px;color:#555">📄 Tracts : <b>${totalTracts}</b></div>
              <div style="font-size:12px;color:#555">📬 Boîtes : <b>${totalBoites}</b></div>
              <hr style="border:none;border-top:1px solid #ddd;margin:6px 0"/>
              ${items.slice(0, 3).map(i => `<div style="font-size:11px;color:#777">• ${i.nom_benevole ?? "—"} (${i.date})</div>`).join("")}
            </div>
          </div>`, { maxWidth: 240 });
        markersRef.current!.addLayer(marker);
      });
    }

    if (layerMode === "tractage" || layerMode === "tous") {
      const counts: Record<string, Tractage[]> = {};
      tractages.forEach(p => { if (p.quartier) { if (!counts[p.quartier]) counts[p.quartier] = []; counts[p.quartier].push(p); } });
      Object.entries(counts).forEach(([quartier, items]) => {
        const coords = QUARTIER_COORDS[quartier]; if (!coords) return;
        const offset: [number, number] = [coords[0] - 0.002, coords[1] + 0.002];
        const totalPortes = items.reduce((s, p) => s + p.nb_portes, 0);
        const totalTracts = items.reduce((s, p) => s + p.nb_tracts, 0);
        const icon = L.divIcon({
          html: `<div style="background:#c97a00;color:white;border-radius:10px;padding:4px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🚪 ${items.length}</div>`,
          className: "", iconAnchor: [20, 15],
        });
        const marker = L.marker(offset, { icon });
        marker.bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:180px">
            <div style="background:#c97a00;color:white;padding:8px 12px;border-radius:6px 6px 0 0;font-weight:700;font-size:14px">🚪 Tractage — ${quartier}</div>
            <div style="padding:10px 12px;background:#f9f9f9;border-radius:0 0 6px 6px">
              <div style="font-size:13px;color:#111;margin-bottom:4px"><b>${items.length}</b> session${items.length > 1 ? "s" : ""}</div>
              <div style="font-size:12px;color:#555">📄 Tracts : <b>${totalTracts}</b></div>
              <div style="font-size:12px;color:#555">🚪 Portes : <b>${totalPortes}</b></div>
              <hr style="border:none;border-top:1px solid #ddd;margin:6px 0"/>
              ${items.slice(0, 3).map(i => `<div style="font-size:11px;color:#777">• ${i.nom_benevole ?? "—"} (${i.date})</div>`).join("")}
            </div>
          </div>`, { maxWidth: 240 });
        markersRef.current!.addLayer(marker);
      });
    }
  }, [responses, boitages, tractages, filterBenevole, filterIntention, layerMode]);

  const filtered = responses.filter(r => {
    const matchB = filterBenevole === "Tous" || r.nom_benevole === filterBenevole;
    const matchI = filterIntention === "Toutes" || r.intention_vote === filterIntention;
    return matchB && matchI;
  });
  const counts: Record<string, number> = {};
  filtered.forEach(r => { if (r.quartier) counts[r.quartier] = (counts[r.quartier] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...sorted.map(s => s[1]), 1);
  const benevoles = ["Tous", ...Array.from(new Set(responses.map(r => r.nom_benevole).filter(Boolean) as string[]))];
  const intentions = ["Toutes", ...Array.from(new Set(responses.map(r => r.intention_vote).filter(Boolean) as string[]))];
  const selectedItems = selectedQuartier ? responses.filter(r => r.quartier === selectedQuartier) : [];

  const layerBtn = (mode: LayerMode, label: string, color: string) => (
    <button key={mode} onClick={() => setLayerMode(mode)} style={{
      padding: "5px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none",
      background: layerMode === mode ? color : C.light, color: layerMode === mode ? "white" : C.text,
      transition: "all 0.15s",
    }}>{label}</button>
  );

  // Contenu sidebar (partagé desktop/mobile)
  const sidebarContent = (
    <>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Afficher</h3>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {layerBtn("tous", "🗺 Tout", C.g1)}
          {layerBtn("visites", "🏠 Visites", C.g1)}
          {layerBtn("boitage", "📬 Boîtage", "#1a3a6b")}
          {layerBtn("tractage", "🚪 Prosp.", "#c97a00")}
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtres visites</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <select value={filterBenevole} onChange={e => setFilterBenevole(e.target.value)}
            style={{ padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "7px", fontSize: "13px", color: C.text }}>
            {benevoles.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={filterIntention} onChange={e => setFilterIntention(e.target.value)}
            style={{ padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "7px", fontSize: "13px", color: C.text }}>
            {intentions.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: C.muted }}>{filtered.length} visite(s) · {boitages.length} boîtage(s) · {tractages.length} prosp.</div>
      </div>

      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase" }}>Légende</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: C.g1, opacity: 0.7 }} />
            <span>Visites citoyennes</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <div style={{ background: "#1a3a6b", color: "white", borderRadius: "6px", padding: "1px 5px", fontSize: "10px", fontWeight: "700" }}>📬</div>
            <span>Boîtage</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <div style={{ background: "#c97a00", color: "white", borderRadius: "6px", padding: "1px 5px", fontSize: "10px", fontWeight: "700" }}>🚪</div>
            <span>Tractage</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px", overflowY: "auto", flex: 1 }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: C.text, textTransform: "uppercase" }}>Classement visites</h3>
        {loading && <p style={{ fontSize: "13px", color: C.muted }}>Chargement...</p>}
        {sorted.map(([q, n], i) => (
          <div key={q} onClick={() => {
            setSelectedQuartier(q === selectedQuartier ? null : q);
            if (QUARTIER_COORDS[q]) mapRef.current?.flyTo(QUARTIER_COORDS[q], 15, { duration: 0.8 });
            if (isMobile) setPanelOpen(false);
          }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "7px", marginBottom: "4px", cursor: "pointer", background: selectedQuartier === q ? "#e8f5ee" : "transparent", transition: "background 0.15s" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: C.muted, width: "16px" }}>{i + 1}</span>
            <div style={{ flex: 1, background: C.light, borderRadius: "3px", height: "14px", overflow: "hidden" }}>
              <div style={{ width: `${(n / max) * 100}%`, height: "100%", background: getColor(n, max), borderRadius: "3px" }} />
            </div>
            <span style={{ fontSize: "12px", color: C.text, width: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: C.g1, minWidth: "16px", textAlign: "right" }}>{n}</span>
          </div>
        ))}
        {sorted.length === 0 && !loading && (
          <p style={{ fontSize: "13px", color: "#aaa", textAlign: "center", marginTop: "20px" }}>Aucune donnée.</p>
        )}
      </div>
    </>
  );

  const quartierDetail = selectedQuartier && selectedItems.length > 0 && (
    <div style={{
      background: C.white,
      borderTop: `2px solid ${C.g1}`,
      overflowY: "auto",
      padding: "14px 20px",
      ...(isMobile ? { maxHeight: "40vh" } : { height: "220px" }),
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? "13px" : "15px", fontWeight: "800", color: C.text }}>
          📍 {selectedQuartier} — {selectedItems.length} visite(s)
        </h3>
        <button onClick={() => setSelectedQuartier(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: C.muted }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "12px", flexWrap: "wrap" }}>
        <span style={{ color: C.g1, fontWeight: "600" }}>🗳 Vote Oui : {selectedItems.filter(i => i.intention_vote === "Oui").length}</span>
        <span style={{ color: C.g4, fontWeight: "600" }}>📝 Inscrits : {selectedItems.filter(i => i.inscrit_listes === "Oui").length}</span>
        <span style={{ color: "#c9a800", fontWeight: "600" }}>💛 Dons : {selectedItems.filter(i => i.souhait_don).length}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "480px" }}>
          <thead>
            <tr style={{ background: C.light }}>
              {["#", "Date", "Bénévole", "Adresse", "Intention", "Inscrit"].map(h => (
                <th key={h} style={{ padding: "5px 8px", textAlign: "left", color: C.muted, fontWeight: "600", fontSize: "11px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedItems.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "4px 8px", color: C.muted }}>#{r.id}</td>
                <td style={{ padding: "4px 8px" }}>{r.date_visite ?? "—"}</td>
                <td style={{ padding: "4px 8px", fontWeight: "600" }}>{r.nom_benevole ?? "—"}</td>
                <td style={{ padding: "4px 8px", color: C.muted, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.adresse ?? "—"}</td>
                <td style={{ padding: "4px 8px" }}>
                  <span style={{ padding: "1px 7px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", background: r.intention_vote === "Oui" ? "#e8f5ee" : r.intention_vote === "Non" ? "#fdecea" : "#fef9e7", color: r.intention_vote === "Oui" ? C.g1 : r.intention_vote === "Non" ? "#b71c1c" : "#7d5a00" }}>
                    {r.intention_vote ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "4px 8px" }}>{r.inscrit_listes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  // LAYOUT MOBILE
  // ══════════════════════════════════════════
  if (isMobile) {
    const HEADER_H = 50;
    const HANDLE_H = 46;

    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', sans-serif" }}>

        {/* Header compact */}
        <div style={{
          background: GRADIENT, padding: "0 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, height: `${HEADER_H}px`, boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Citizen13" style={{ height: "26px" }} onError={e => (e.currentTarget.style.display = "none")} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: "600" }}>
              Carte — Paris 13
            </span>
          </div>
          <button onClick={() => navigate("/admin")} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "7px", cursor: "pointer", fontSize: "12px" }}>
            ← Dashboard
          </button>
        </div>

        {/* Barre de couches flottante sur la carte */}
        <div style={{
          position: "absolute", top: `${HEADER_H + 8}px`, left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          display: "flex", gap: "5px",
          background: "rgba(255,255,255,0.95)", borderRadius: "10px",
          padding: "6px 8px", boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}>
          {layerBtn("tous", "🗺", C.g1)}
          {layerBtn("visites", "🏠", C.g1)}
          {layerBtn("boitage", "📬", "#1a3a6b")}
          {layerBtn("tractage", "🚪", "#c97a00")}
        </div>

        {/* Carte — plein écran restant */}
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />
        </div>

        {/* Détail quartier sélectionné */}
        {selectedQuartier && selectedItems.length > 0 && (
          <div style={{ flexShrink: 0, zIndex: 500 }}>
            {quartierDetail}
          </div>
        )}

        {/* Drawer bottom — filtres & classement */}
        <div style={{
          flexShrink: 0, background: C.white,
          borderTop: `2px solid ${C.border}`,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
          zIndex: 600, display: "flex", flexDirection: "column",
          maxHeight: panelOpen ? "55vh" : `${HANDLE_H}px`,
          transition: "max-height 0.28s ease",
          overflow: "hidden",
        }}>
          {/* Poignée */}
          <button onClick={() => setPanelOpen(p => !p)} style={{
            flexShrink: 0, height: `${HANDLE_H}px`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", background: "none", border: "none",
            cursor: "pointer", width: "100%", boxSizing: "border-box",
            borderBottom: panelOpen ? `1px solid ${C.border}` : "none",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: "7px", width: "36px", height: "4px",
              borderRadius: "2px", background: "#ccc",
            }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: C.text, marginTop: "6px" }}>
              🔍 Filtres & Classement
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
              <span style={{ fontSize: "11px", color: C.muted }}>{filtered.length} visites</span>
              <span style={{
                fontSize: "12px", color: C.muted,
                display: "inline-block",
                transform: panelOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.28s",
              }}>▲</span>
            </div>
          </button>

          {/* Contenu scrollable */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {sidebarContent}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // LAYOUT DESKTOP (inchangé)
  // ══════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: GRADIENT, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/logo.png" alt="Citizen13" style={{ height: "40px" }} onError={e => (e.currentTarget.style.display = "none")} />
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "500" }}>
            Carte des actions — Paris 13ème
          </span>
        </div>
        <button onClick={() => navigate("/admin")} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <div style={{ width: "290px", background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {sidebarContent}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div ref={mapContainerRef} style={{ flex: 1 }} />
          {quartierDetail}
        </div>
      </div>
    </div>
  );
}
