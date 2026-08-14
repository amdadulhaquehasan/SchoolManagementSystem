"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { normalizeError, resolveFileUrl } from "@/lib/apiClient";
import type { AssignmentDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import ConfirmModal from "@/components/ConfirmModal";
import { AssignmentStatusBadge } from "@/components/StatusBadge";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const schema = z.object({
  Title: z.string().min(1, "Title is required").max(300),
  Description: z.string().max(4000).optional(),
  DeadlineUtc: z.string().min(1, "Deadline is required"),
  MaxMarks: z.coerce.number().int().min(1).max(1000),
  RemoveExistingFile: z.boolean(),
  File: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditAssignmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getById(assignmentId);
      setAssignment(data);
      reset({
        Title: data.title,
        Description: data.description ?? "",
        DeadlineUtc: toDatetimeLocal(data.deadlineUtc),
        MaxMarks: data.maxMarks,
        RemoveExistingFile: false,
      });
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, reset]);

  useEffect(() => {
    if (!Number.isNaN(assignmentId)) load();
  }, [assignmentId, load]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await assignmentApi.update(assignmentId, values);
      toast.success("Assignment updated.");
      setAssignment(updated);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async () => {
    if (!assignment) return;
    setSubmitting(true);
    try {
      const updated = await assignmentApi.changeStatus(assignment.id, {
        publish: assignment.status !== "Published",
      });
      setAssignment(updated);
      toast.success(updated.status === "Published" ? "Published." : "Reverted to draft.");
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentApi.remove(assignmentId);
      toast.success("Assignment deleted.");
      router.push("/teacher");
    } catch (err) {
      toast.error(normalizeError(err).message);
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading assignment..." />;
  if (!assignment) return <ErrorAlert message={error ?? "Assignment not found."} />;

  return (
    <div className="py-2">
      <Button variant="link" className="px-0 mb-2" onClick={() => router.push("/teacher")}>
        &larr; Back to My Assignments
      </Button>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{assignment.title}</h1>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <AssignmentStatusBadge status={assignment.status} />
            <span className="text-muted small">
              {assignment.subjectName} · {assignment.classCourseName}
            </span>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button as={Link as any} href={`/teacher/assignments/${assignment.id}/submissions`} variant="outline-primary">
            View Submissions ({assignment.submissionCount})
          </Button>
          <Button
            variant={assignment.status === "Published" ? "outline-warning" : "outline-success"}
            onClick={togglePublish}
            disabled={submitting}
          >
            {assignment.status === "Published" ? "Unpublish" : "Publish"}
          </Button>
          <Button variant="outline-danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="eTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control isInvalid={!!errors.Title} {...register("Title")} />
              <Form.Control.Feedback type="invalid">{errors.Title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="eDeadline">
                  <Form.Label>Deadline</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    isInvalid={!!errors.DeadlineUtc}
                    {...register("DeadlineUtc")}
                  />
                  <Form.Control.Feedback type="invalid">{errors.DeadlineUtc?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="eMaxMarks">
                  <Form.Label>Max marks</Form.Label>
                  <Form.Control type="number" min={1} max={1000} isInvalid={!!errors.MaxMarks} {...register("MaxMarks")} />
                  <Form.Control.Feedback type="invalid">{errors.MaxMarks?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="eDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} {...register("Description")} />
            </Form.Group>

            {assignment.attachmentUrl && (
              <div className="mb-3">
                <Form.Label className="d-block">Current attachment</Form.Label>
                <a href={resolveFileUrl(assignment.attachmentUrl) ?? "#"} target="_blank" rel="noreferrer">
                  📎 {assignment.attachmentOriginalFileName}
                </a>
                <Form.Check
                  className="mt-2"
                  type="checkbox"
                  label="Remove this attachment"
                  {...register("RemoveExistingFile")}
                />
              </div>
            )}

            <Form.Group className="mb-4" controlId="eFile">
              <Form.Label>{assignment.attachmentUrl ? "Replace attachment" : "Add attachment"}</Form.Label>
              <Form.Control type="file" {...register("File")} />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : "Save Changes"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={confirmDelete}
        title="Delete assignment"
        body={`Delete "${assignment.title}"? All student submissions for it will also be deleted.`}
        confirmLabel="Delete"
        isBusy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
