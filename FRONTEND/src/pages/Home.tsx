import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Home redirige automatiquement vers /login
// Si déjà connecté, ProtectedRoute gère la redirection vers /admin ou /visit
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && (role === "admin" || role === "superviseur")) {
      navigate("/admin", { replace: true });
    } else if (token) {
      const user = localStorage.getItem("user") ?? "";
      navigate("/visit", { replace: true, state: { agent: user } });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
}
