"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/endpoints/admin";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTeacherModal({
  show,
  onClose,
  onCreated,
}: {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await adminApi.createTeacher(values);
      toast.success(`Teacher account created for ${values.firstName} ${values.lastName}.`);
      reset();
      onCreated();
    } catch (err) {
      setServerError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title as="h5">Create Teacher Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
          <Form.Group className="mb-3" controlId="teacherFirstName">
            <Form.Label>First name</Form.Label>
            <Form.Control isInvalid={!!errors.firstName} {...register("firstName")} />
            <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="teacherLastName">
            <Form.Label>Last name</Form.Label>
            <Form.Control isInvalid={!!errors.lastName} {...register("lastName")} />
            <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="teacherEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" isInvalid={!!errors.email} {...register("email")} />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="teacherPassword">
            <Form.Label>Temporary password</Form.Label>
            <Form.Control type="password" isInvalid={!!errors.password} {...register("password")} />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            <Form.Text muted>Share this with the teacher securely; they can use it to log in.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : "Create Teacher"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
