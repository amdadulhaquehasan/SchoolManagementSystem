"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import ErrorAlert from "@/components/ErrorAlert";
import GraduationCapIcon from "@/components/icons/GraduationCapIcon";
import type { NormalizedApiError } from "@/lib/apiClient";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const { login, homeRouteFor } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  const [serverError, setServerError] = useState<string | null>(
    expired ? "Your session expired. Please log in again." : null
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.fullName}!`);
      router.push(homeRouteFor(user.role));
    } catch (err) {
      const normalized = err as NormalizedApiError;
      setServerError(normalized.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={9} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-2 text-primary">
                  <GraduationCapIcon size={40} />
                </div>
                <h1 className="h4 fw-bold mb-1">School Management System</h1>
                <p className="text-muted small mb-0">Sign in to your account</p>
              </div>

              <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />

              <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@school.com"
                    isInvalid={!!errors.email}
                    {...register("email")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    isInvalid={!!errors.password}
                    {...register("password")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Form>

              <p className="text-muted small text-center mt-4 mb-0">
                Don&apos;t have an account? Ask your Admin to create one for you.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
