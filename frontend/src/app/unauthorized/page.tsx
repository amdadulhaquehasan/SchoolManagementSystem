"use client";

import Link from "next/link";
import { Button, Container } from "react-bootstrap";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user, homeRouteFor } = useAuth();

  return (
    <Container className="text-center py-5">
      <div className="display-1 mb-3">🚫</div>
      <h1 className="h3 mb-2">Access denied</h1>
      <p className="text-muted mb-4">You don&apos;t have permission to view this page.</p>
      <Button as={Link as any} href={user ? homeRouteFor(user.role) : "/login"} variant="primary">
        Back to safety
      </Button>
    </Container>
  );
}
