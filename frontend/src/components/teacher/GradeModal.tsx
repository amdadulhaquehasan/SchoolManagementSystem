"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { SubmissionDto } from "@/types/dtos";

export default function GradeModal({
  show,
  submission,
  onClose,
  onSaved,
}: {
  show: boolean;
  submission: SubmissionDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    marksObtained: z.coerce
      .number()
      .int()
      .min(0, "Cannot be negative")
      .max(submission?.maxMarks ?? 1000, `Cannot exceed max marks (${submission?.maxMarks ?? 0})`),
    feedback: z.string().max(4000).optional(),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (show && submission) {
      reset({ marksObtained: submission.marksObtained ?? 0, feedback: submission.feedback ?? "" });
      setServerError(null);
    }
  }, [show, submission, reset]);

  if (!submission) return null;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await submissionApi.grade(submission.id, values);
      toast.success(`${submission.studentName}'s submission graded.`);
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
          <Modal.Title as="h5">Grade — {submission.studentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
          <Form.Group className="mb-3" controlId="gMarks">
            <Form.Label>Marks obtained (out of {submission.maxMarks})</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={submission.maxMarks}
              isInvalid={!!errors.marksObtained}
              {...register("marksObtained")}
            />
            <Form.Control.Feedback type="invalid">{errors.marksObtained?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="gFeedback">
            <Form.Label>Feedback (optional)</Form.Label>
            <Form.Control as="textarea" rows={4} {...register("feedback")} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : "Save Grade"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
