"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function HomePage() {
  const { user, isLoading, homeRouteFor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? homeRouteFor(user.role) : "/login");
  }, [isLoading, user, homeRouteFor, router]);

  return <LoadingSpinner label="Loading School Management System..." />;
}
