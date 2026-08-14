"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { subjectApi } from "@/lib/endpoints/subjects";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { ClassCourseDto, SubjectDto } from "@/types/dtos";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  classCourseId: z.string().min(1, "Select a class/course"),
});

type FormValues = z.infer<typeof schema>;

export default function SubjectFormModal({
  show,
  editing,
  classCourses,
  onClose,
  onSaved,
}: {
  show: boolean;
  editing: SubjectDto | null;
  classCourses: ClassCourseDto[];
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
      reset({
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        classCourseId: editing ? String(editing.classCourseId) : "",
      });
      setServerError(null);
    }
  }, [show, editing, reset]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    const dto = { ...values, classCourseId: Number(values.classCourseId) };
    try {
      if (editing) {
        await subjectApi.update(editing.id, dto);
        toast.success(`"${values.name}" updated.`);
      } else {
        await subjectApi.create(dto);
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
          <Modal.Title as="h5">{editing ? "Edit Subject" : "Add Subject"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
          <Form.Group className="mb-3" controlId="subjName">
            <Form.Label>Name</Form.Label>
            <Form.Control placeholder="e.g. Mathematics" isInvalid={!!errors.name} {...register("name")} />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="subjDescription">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} {...register("description")} />
          </Form.Group>
          <Form.Group controlId="subjClassCourse">
            <Form.Label>Class / Course</Form.Label>
            <Form.Select isInvalid={!!errors.classCourseId} {...register("classCourseId")}>
              <option value="">Select a class/course...</option>
              {classCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.classCourseId?.message}</Form.Control.Feedback>
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
