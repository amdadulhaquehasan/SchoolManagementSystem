"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Col, Row } from "react-bootstrap";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { normalizeError } from "@/lib/apiClient";
import type { AssignmentDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { SubmissionStatusBadge } from "@/components/StatusBadge";

function isPastDue(deadlineUtc: string) {
  return new Date(deadlineUtc).getTime() < Date.now();
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getAll();
      data.sort((a, b) => new Date(a.deadlineUtc).getTime() - new Date(b.deadlineUtc).getTime());
      setAssignments(data);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="py-2">
      <h1 className="h3 mb-1">Assignments</h1>
      <p className="text-muted mb-3">Assignments published for your enrolled classes/courses.</p>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <p className="text-muted">
          No assignments yet. If you were recently enrolled, check back soon, or contact your Admin
          if you believe this is a mistake.
        </p>
      ) : (
        <Row xs={1} md={2} xl={3} className="g-3">
          {assignments.map((a) => (
            <Col key={a.id}>
              <Card as={Link as any} href={`/student/assignments/${a.id}`} className="h-100 text-decoration-none border-0 shadow-sm card-hover">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h6 mb-0 text-dark">{a.title}</Card.Title>
                    {a.mySubmissionStatus ? (
                      <SubmissionStatusBadge status={a.mySubmissionStatus} />
                    ) : (
                      <span className={`badge ${isPastDue(a.deadlineUtc) ? "bg-danger" : "bg-outline-secondary border text-muted"}`}>
                        {isPastDue(a.deadlineUtc) ? "Missed" : "Not submitted"}
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-2">{a.subjectName} · {a.classCourseName}</p>
                  {a.description && <p className="small text-truncate-2 text-muted">{a.description}</p>}
                  <div className="small text-muted mt-2">
                    Due {new Date(a.deadlineUtc).toLocaleString()}
                  </div>
                  <div className="small text-muted">Max marks: {a.maxMarks}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
