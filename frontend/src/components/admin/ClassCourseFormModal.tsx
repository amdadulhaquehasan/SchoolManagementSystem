"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { ClassCourseDto } from "@/types/dtos";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ClassCourseFormModal({
  show,
  editing,
  onClose,
  onSaved,
}: {
  show: boolean;
  editing: ClassCourseDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (show) {
      reset({ name: editing?.name ?? "", description: editing?.description ?? "" });
      setServerError(null);
    }
  }, [show, editing, reset]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      if (editing) {
        await classCourseApi.update(editing.id, values);
        toast.success(`"${values.name}" updated.`);
      } else {
        await classCourseApi.create(values);
        toast.success(`"${values.name}" created.`);
      }
      onSaved();
    } catch (err) {
      setServerError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title as="h5">{editing ? "Edit Class / Course" : "Add Class / Course"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
          <Form.Group className="mb-3" controlId="ccName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              placeholder="e.g. Grade 10 - A"
              isInvalid={!!errors.name}
              {...register("name")}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="ccDescription">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control as="textarea" rows={3} {...register("description")} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : editing ? "Save changes" : "Create"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
