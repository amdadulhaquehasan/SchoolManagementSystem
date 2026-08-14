"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Table } from "react-bootstrap";
import { submissionApi } from "@/lib/endpoints/submissions";
import { normalizeError, resolveFileUrl } from "@/lib/apiClient";
import type { SubmissionDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { SubmissionStatusBadge } from "@/components/StatusBadge";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await submissionApi.getMine();
      data.sort((a, b) => new Date(b.submittedAtUtc).getTime() - new Date(a.submittedAtUtc).getTime());
      setSubmissions(data);
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
      <h1 className="h3 mb-1">My Grades</h1>
      <p className="text-muted mb-3">Status, marks, and feedback for everything you&apos;ve submitted.</p>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading your submissions..." />
      ) : submissions.length === 0 ? (
        <p className="text-muted">You haven&apos;t submitted any assignments yet.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Marks</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">
                    <Link href={`/student/assignments/${s.assignmentId}`}>{s.assignmentTitle}</Link>
                  </td>
                  <td className="small">{new Date(s.submittedAtUtc).toLocaleString()}</td>
                  <td>
                    <SubmissionStatusBadge status={s.status} />
                  </td>
                  <td>
                    {s.marksObtained !== null && s.marksObtained !== undefined
                      ? `${s.marksObtained} / ${s.maxMarks}`
                      : "—"}
                  </td>
                  <td className="small text-muted" style={{ maxWidth: 280 }}>
                    <div className="text-truncate-2">{s.feedback || "—"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
