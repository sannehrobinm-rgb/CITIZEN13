"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) { router.replace("/login"); return; }
    if (roles && role && !roles.includes(role)) { router.replace("/"); }
  }, [router, roles]);
useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isDemo = localStorage.getItem("demo_mode"); // ← AJOUT

  if (!token) { router.replace("/login"); return; }
  if (isDemo) return; // ← AJOUT : mode démo, on laisse passer
  if (roles && role && !roles.includes(role)) { router.replace("/"); }
}, [router, roles]);
  return <>{children}</>;
}
