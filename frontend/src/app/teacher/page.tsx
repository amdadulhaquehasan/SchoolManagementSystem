"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { assignmentApi } from "@/lib/endpoints/assignments";
import { normalizeError } from "@/lib/apiClient";
import type { AssignmentDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import ConfirmModal from "@/components/ConfirmModal";
import { AssignmentStatusBadge } from "@/components/StatusBadge";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AssignmentDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getAll();
      data.sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
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

  const togglePublish = async (a: AssignmentDto) => {
    setBusyId(a.id);
    try {
      await assignmentApi.changeStatus(a.id, { publish: a.status !== "Published" });
      toast.success(a.status === "Published" ? "Reverted to draft." : "Assignment published.");
      await load();
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await assignmentApi.remove(pendingDelete.id);
      toast.success(`"${pendingDelete.title}" deleted.`);
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">My Assignments</h1>
          <p className="text-muted mb-0">Create, publish, and grade assignments for the classes.</p>
        </div>
        <Button as={Link as any} href="/teacher/assignments/new" variant="primary">
          + New Assignment
        </Button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <p className="text-muted">You haven&apos;t created any assignments yet.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject / Class</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Submissions</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold">
                    <Link href={`/teacher/assignments/${a.id}`}>{a.title}</Link>
                  </td>
                  <td>
                    {a.subjectName}
                    <div className="text-muted small">{a.classCourseName}</div>
                  </td>
                  <td className="small">{new Date(a.deadlineUtc).toLocaleString()}</td>
                  <td>
                    <AssignmentStatusBadge status={a.status} />
                  </td>
                  <td>
                    <Link href={`/teacher/assignments/${a.id}/submissions`}>{a.submissionCount}</Link>
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <Button
                        size="sm"
                        variant={a.status === "Published" ? "outline-warning" : "outline-success"}
                        disabled={busyId === a.id}
                        onClick={() => togglePublish(a)}
                      >
                        {a.status === "Published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setPendingDelete(a)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmModal
        show={!!pendingDelete}
        title="Delete assignment"
        body={
          pendingDelete
            ? `Delete "${pendingDelete.title}"? All student submissions for it will also be deleted.`
            : ""
        }
        confirmLabel="Delete"
        isBusy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
