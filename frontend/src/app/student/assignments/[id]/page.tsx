"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError, resolveFileUrl } from "@/lib/apiClient";
import type { AssignmentDto, SubmissionDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { SubmissionStatusBadge } from "@/components/StatusBadge";
import SubmissionForm from "@/components/student/SubmissionForm";

export default function StudentAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [mySubmission, setMySubmission] = useState<SubmissionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, mine] = await Promise.all([assignmentApi.getById(assignmentId), submissionApi.getMine()]);
      setAssignment(a);
      setMySubmission(mine.find((s) => s.assignmentId === assignmentId) ?? null);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (!Number.isNaN(assignmentId)) load();
  }, [assignmentId, load]);

  if (loading) return <LoadingSpinner label="Loading assignment..." />;
  if (!assignment) return <ErrorAlert message={error ?? "Assignment not found."} />;

  const deadlinePassed = new Date(assignment.deadlineUtc).getTime() < Date.now();

  return (
    <div className="py-2">
      <Button variant="link" className="px-0 mb-2" onClick={() => router.push("/student")}>
        &larr; Back to Assignments
      </Button>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h1 className="h4 mb-0">{assignment.title}</h1>
                {mySubmission && <SubmissionStatusBadge status={mySubmission.status} />}
              </div>
              <p className="text-muted small mb-3">
                {assignment.subjectName} · {assignment.classCourseName} · By {assignment.teacherName}
              </p>

              <div className="d-flex gap-3 flex-wrap mb-3">
                <Badge bg={deadlinePassed ? "danger" : "light"} text={deadlinePassed ? undefined : "dark"} className={deadlinePassed ? "" : "border"}>
                  Deadline: {new Date(assignment.deadlineUtc).toLocaleString()}
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Max marks: {assignment.maxMarks}
                </Badge>
              </div>

              {assignment.description && (
                <div className="mb-3">
                  <h2 className="h6">Instructions</h2>
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{assignment.description}</p>
                </div>
              )}

              {assignment.attachmentUrl && (
                <div>
                  <h2 className="h6">Assignment file</h2>
                  <a href={resolveFileUrl(assignment.attachmentUrl) ?? "#"} target="_blank" rel="noreferrer">
                    📎 {assignment.attachmentOriginalFileName}
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold">
              {mySubmission ? "Your Submission" : "Submit Your Answer"}
            </Card.Header>
            <Card.Body className="p-4">
              {mySubmission?.status === "Graded" && (
                <div className="mb-3 p-3 bg-light rounded">
                  <div className="fw-semibold">
                    Marks: {mySubmission.marksObtained} / {mySubmission.maxMarks}
                  </div>
                  {mySubmission.feedback && <p className="mb-0 mt-1 small">{mySubmission.feedback}</p>}
                </div>
              )}
              <SubmissionForm assignment={assignment} existing={mySubmission} onSaved={load} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
