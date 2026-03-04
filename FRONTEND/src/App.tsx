// App.jsx
import  { BrowserRouter, Routes, Route } from "react-router-dom";

// Import de toutes les pages de l'application
import Home from "./pages/Home.tsx";
import Visit from "./pages/Visit.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
//import AdminForms from ""; // si tu crées cette page pour l'administration des formulaires

export default function App() {
  return (
    // BrowserRouter : conteneur principal pour React Router
    <BrowserRouter>
      {/* Routes : contient toutes les routes de l'application */}
      <Routes>
        {/* Route pour la page d'accueil */}
        <Route path="/" element={<Home />} />

        {/* Route pour la page de visite */}
        <Route path="/visit" element={<Visit />} />

        {/* Route pour le tableau de bord admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Route pour la gestion des formulaires admin 
        <Route path="/admin/forms" element={<AdminForms />} />*/}
      </Routes>
    </BrowserRouter>
  );
}
