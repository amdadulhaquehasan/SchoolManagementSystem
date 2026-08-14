"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError, resolveFileUrl } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { AssignmentDto, SubmissionDto } from "@/types/dtos";

const schema = z
  .object({
    TextAnswer: z.string().max(8000).optional(),
    File: z.any().optional(),
    RemoveExistingFile: z.boolean().optional(),
  })
  .refine((data) => (data.TextAnswer && data.TextAnswer.trim().length > 0) || (data.File && data.File.length > 0), {
    message: "Provide a text answer, a file, or both.",
    path: ["TextAnswer"],
  });

type FormValues = z.infer<typeof schema>;

export default function SubmissionForm({
  assignment,
  existing,
  onSaved,
}: {
  assignment: AssignmentDto;
  existing: SubmissionDto | null;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isPastDeadline = new Date(assignment.deadlineUtc).getTime() < Date.now();
  const isGraded = existing?.status === "Graded";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { TextAnswer: existing?.textAnswer ?? "", RemoveExistingFile: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      if (existing) {
        await submissionApi.update(existing.id, {
          TextAnswer: values.TextAnswer,
          File: values.File,
          RemoveExistingFile: !!values.RemoveExistingFile,
        });
        toast.success("Submission updated.");
      } else {
        await submissionApi.submit(assignment.id, { TextAnswer: values.TextAnswer, File: values.File });
        toast.success("Assignment submitted!");
      }
      onSaved();
    } catch (err) {
      setServerError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isPastDeadline && !existing) {
    return <ErrorAlert message="The deadline has passed and no submission was made." />;
  }

  if (existing && (isPastDeadline || isGraded)) {
    return (
      <div>
        <p className="text-muted mb-2">
          {isGraded ? "This submission has been graded and can no longer be edited." : "The deadline has passed — this submission can no longer be edited."}
        </p>
        {existing.textAnswer && <p className="mb-2">{existing.textAnswer}</p>}
        {existing.fileUrl && (
          <a href={resolveFileUrl(existing.fileUrl) ?? "#"} target="_blank" rel="noreferrer">
            📎 {existing.originalFileName}
          </a>
        )}
      </div>
    );
  }

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
      <Form.Group className="mb-3" controlId="sAnswer">
        <Form.Label>Your answer</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="Type your answer here (optional if you attach a file below)"
          isInvalid={!!errors.TextAnswer}
          {...register("TextAnswer")}
        />
        <Form.Control.Feedback type="invalid">{errors.TextAnswer?.message}</Form.Control.Feedback>
      </Form.Group>

      {existing?.fileUrl && (
        <div className="mb-3">
          <Form.Label className="d-block">Current attachment</Form.Label>
          <a href={resolveFileUrl(existing.fileUrl) ?? "#"} target="_blank" rel="noreferrer">
            📎 {existing.originalFileName}
          </a>
          <Form.Check className="mt-2" type="checkbox" label="Remove this attachment" {...register("RemoveExistingFile")} />
        </div>
      )}

      <Form.Group className="mb-4" controlId="sFile">
        <Form.Label>{existing?.fileUrl ? "Replace attachment" : "Attach a file (optional)"}</Form.Label>
        <Form.Control type="file" {...register("File")} />
        <Form.Text muted>Allowed: PDF, Word, Excel, PowerPoint, text, zip/rar, images. Max 10 MB.</Form.Text>
      </Form.Group>

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? <Spinner size="sm" animation="border" /> : existing ? "Update Submission" : "Submit Assignment"}
      </Button>
    </Form>
  );
}
