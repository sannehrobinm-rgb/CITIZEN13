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

  return <>{children}</>;
}
