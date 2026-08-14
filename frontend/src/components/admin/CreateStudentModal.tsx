"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/endpoints/admin";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { ClassCourseDto } from "@/types/dtos";

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  classCourseId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateStudentModal({
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
  const [classCourses, setClassCourses] = useState<ClassCourseDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!show) return;
    classCourseApi.getAll().then(setClassCourses).catch(() => setClassCourses([]));
  }, [show]);

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await adminApi.createStudent({
        ...values,
        classCourseId: values.classCourseId ? Number(values.classCourseId) : null,
      });
      toast.success(`Student account created for ${values.firstName} ${values.lastName}.`);
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
          <Modal.Title as="h5">Create Student Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
          <Form.Group className="mb-3" controlId="studentFirstName">
            <Form.Label>First name</Form.Label>
            <Form.Control isInvalid={!!errors.firstName} {...register("firstName")} />
            <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="studentLastName">
            <Form.Label>Last name</Form.Label>
            <Form.Control isInvalid={!!errors.lastName} {...register("lastName")} />
            <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="studentEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" isInvalid={!!errors.email} {...register("email")} />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="studentPassword">
            <Form.Label>Temporary password</Form.Label>
            <Form.Control type="password" isInvalid={!!errors.password} {...register("password")} />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="studentClassCourse">
            <Form.Label>Enroll into class/course (optional)</Form.Label>
            <Form.Select {...register("classCourseId")}>
              <option value="">— Not enrolled yet —</option>
              {classCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : "Create Student"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
