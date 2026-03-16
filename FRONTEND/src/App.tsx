import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Visit from "./pages/Visit.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Login from "./pages/Login.tsx";
import MapPage from "./pages/MapPage.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/visit" element={<ProtectedRoute><Visit /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin", "superviseur"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute roles={["admin", "superviseur"]}><MapPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
