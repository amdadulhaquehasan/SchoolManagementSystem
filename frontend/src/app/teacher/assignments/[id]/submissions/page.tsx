"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Table } from "react-bootstrap";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError, resolveFileUrl } from "@/lib/apiClient";
import type { AssignmentDto, SubmissionDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { SubmissionStatusBadge } from "@/components/StatusBadge";
import GradeModal from "@/components/teacher/GradeModal";
import StatusModal from "@/components/teacher/StatusModal";

export default function AssignmentSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grading, setGrading] = useState<SubmissionDto | null>(null);
  const [changingStatus, setChangingStatus] = useState<SubmissionDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, subs] = await Promise.all([
        assignmentApi.getById(assignmentId),
        submissionApi.getByAssignment(assignmentId),
      ]);
      setAssignment(a);
      setSubmissions(subs);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (!Number.isNaN(assignmentId)) load();
  }, [assignmentId, load]);

  if (loading) return <LoadingSpinner label="Loading submissions..." />;

  return (
    <div className="py-2">
      <Button variant="link" className="px-0 mb-2" onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}>
        &larr; Back to Assignment
      </Button>

      <h1 className="h3 mb-1">Submissions {assignment ? `— ${assignment.title}` : ""}</h1>
      <p className="text-muted mb-3">{submissions.length} submission{submissions.length === 1 ? "" : "s"}</p>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {submissions.length === 0 ? (
        <p className="text-muted">No students have submitted yet.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Answer</th>
                <th>Marks</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.studentName}</td>
                  <td className="small">{new Date(s.submittedAtUtc).toLocaleString()}</td>
                  <td>
                    <SubmissionStatusBadge status={s.status} />
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    {s.textAnswer && <div className="text-truncate-2 small">{s.textAnswer}</div>}
                    {s.fileUrl && (
                      <a
                        href={resolveFileUrl(s.fileUrl) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="d-inline-block small"
                      >
                        📎 {s.originalFileName}
                      </a>
                    )}
                  </td>
                  <td>{s.marksObtained !== null && s.marksObtained !== undefined ? `${s.marksObtained} / ${s.maxMarks}` : "—"}</td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <Button size="sm" variant="outline-primary" onClick={() => setGrading(s)}>
                        Grade
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => setChangingStatus(s)}>
                        Status
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <GradeModal
        show={!!grading}
        submission={grading}
        onClose={() => setGrading(null)}
        onSaved={() => {
          setGrading(null);
          load();
        }}
      />
      <StatusModal
        show={!!changingStatus}
        submission={changingStatus}
        onClose={() => setChangingStatus(null)}
        onSaved={() => {
          setChangingStatus(null);
          load();
        }}
      />
    </div>
  );
}
