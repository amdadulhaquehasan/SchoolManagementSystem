"use client";

import { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { SubmissionDto, SubmissionStatus } from "@/types/dtos";

const STATUS_OPTIONS: SubmissionStatus[] = [
  "Submitted",
  "Late",
  "UnderReview",
  "Graded",
  "Resubmitted",
  "Rejected",
];

export default function StatusModal({
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
  const [status, setStatus] = useState<SubmissionStatus>("Submitted");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!submission) return null;

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submissionApi.changeStatus(submission.id, { status });
      toast.success("Status updated.");
      onSaved();
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered onEnter={() => setStatus(submission.status)}>
      <Modal.Header closeButton>
        <Modal.Title as="h5">Change Status — {submission.studentName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
        <Form.Group controlId="statusSelect">
          <Form.Label>New status</Form.Label>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={submitting}>
          {submitting ? <Spinner size="sm" animation="border" /> : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
