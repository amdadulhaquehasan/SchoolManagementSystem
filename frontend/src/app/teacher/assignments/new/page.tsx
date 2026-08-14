"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { subjectApi } from "@/lib/endpoints/subjects";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { normalizeError } from "@/lib/apiClient";
import type { SubjectDto } from "@/types/dtos";
import ErrorAlert from "@/components/ErrorAlert";
import LoadingSpinner from "@/components/LoadingSpinner";

const schema = z
  .object({
    Title: z.string().min(1, "Title is required").max(300),
    Description: z.string().max(4000).optional(),
    DeadlineUtc: z.string().min(1, "Deadline is required"),
    MaxMarks: z.coerce.number().int().min(1, "Must be at least 1").max(1000, "Must be at most 1000"),
    SubjectId: z.string().min(1, "Select a subject"),
    Publish: z.boolean(),
    File: z.any().optional(),
  })
  .refine(
    (data) => (data.Description && data.Description.trim().length > 0) || (data.File && data.File.length > 0),
    { message: "Provide a description, a file, or both.", path: ["Description"] }
  )
  .refine((data) => new Date(data.DeadlineUtc).getTime() > Date.now(), {
    message: "Deadline must be in the future.",
    path: ["DeadlineUtc"],
  });

type FormValues = z.infer<typeof schema>;

export default function NewAssignmentPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [mySubjects, setMySubjects] = useState<SubjectDto[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { Publish: false, MaxMarks: 100 },
  });

  useEffect(() => {
    if (!user) return;
    subjectApi
      .getAll()
      .then((all) =>
        setMySubjects(all.filter((s) => s.assignedTeachers.some((t) => t.id === user.userId)))
      )
      .catch((err) => setServerError(normalizeError(err).message))
      .finally(() => setLoadingSubjects(false));
  }, [user]);

  const onSubmit = async (values: FormValues) => {
    const subject = mySubjects.find((s) => s.id === Number(values.SubjectId));
    if (!subject) {
      setServerError("Please select a valid subject.");
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const created = await assignmentApi.create({
        Title: values.Title,
        Description: values.Description,
        DeadlineUtc: values.DeadlineUtc,
        MaxMarks: values.MaxMarks,
        SubjectId: subject.id,
        ClassCourseId: subject.classCourseId,
        Publish: values.Publish,
        File: values.File,
      });
      toast.success(`"${created.title}" created${values.Publish ? " and published" : " as draft"}.`);
      router.push("/teacher");
    } catch (err) {
      setServerError(normalizeError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubjects) return <LoadingSpinner label="Loading your subjects..." />;

  return (
    <div className="py-2">
      <h1 className="h3 mb-3">New Assignment</h1>

      {mySubjects.length === 0 ? (
        <ErrorAlert message="You are not assigned to teach any subject yet. Ask an Admin to assign you to a subject before creating assignments." />
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} />
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="aTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control isInvalid={!!errors.Title} {...register("Title")} />
                <Form.Control.Feedback type="invalid">{errors.Title?.message}</Form.Control.Feedback>
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="aSubject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Select isInvalid={!!errors.SubjectId} {...register("SubjectId")}>
                      <option value="">Select a subject...</option>
                      {mySubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.classCourseName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.SubjectId?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Group controlId="aDeadline">
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      isInvalid={!!errors.DeadlineUtc}
                      {...register("DeadlineUtc")}
                    />
                    <Form.Control.Feedback type="invalid">{errors.DeadlineUtc?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Group controlId="aMaxMarks">
                    <Form.Label>Max marks</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={1000}
                      isInvalid={!!errors.MaxMarks}
                      {...register("MaxMarks")}
                    />
                    <Form.Control.Feedback type="invalid">{errors.MaxMarks?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="aDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Written instructions for the assignment (optional if you attach a file below)"
                  isInvalid={!!errors.Description}
                  {...register("Description")}
                />
                <Form.Control.Feedback type="invalid">{errors.Description?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="aFile">
                <Form.Label>Attachment (optional if description is provided)</Form.Label>
                <Form.Control type="file" {...register("File")} />
                <Form.Text muted>Allowed: PDF, Word, Excel, PowerPoint, text, zip/rar, images. Max 10 MB.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4" controlId="aPublish">
                <Form.Check type="checkbox" label="Publish immediately (visible to students)" {...register("Publish")} />
                <Form.Text muted>Leave unchecked to save as a draft you can publish later.</Form.Text>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? <Spinner size="sm" animation="border" /> : "Create Assignment"}
                </Button>
                <Button variant="outline-secondary" onClick={() => router.push("/teacher")} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
