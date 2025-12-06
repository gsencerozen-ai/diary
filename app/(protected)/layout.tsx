"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <main className="h-[calc(100vh-73px)]">{children}</main>
    </div>
  );
}
