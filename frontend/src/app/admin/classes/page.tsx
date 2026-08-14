"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { normalizeError } from "@/lib/apiClient";
import type { ClassCourseDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import ConfirmModal from "@/components/ConfirmModal";
import ClassCourseFormModal from "@/components/admin/ClassCourseFormModal";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassCourseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClassCourseDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClasses(await classCourseApi.getAll());
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c: ClassCourseDto) => {
    setEditing(c);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await classCourseApi.remove(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" deleted.`);
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
          <h1 className="h3 mb-1">Classes &amp; Courses</h1>
          <p className="text-muted mb-0">Manage classes/courses and see enrollment / subject counts.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add Class / Course
        </Button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading classes..." />
      ) : classes.length === 0 ? (
        <p className="text-muted">No classes/courses yet. Create one to get started.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Subjects</th>
                <th>Enrolled Students</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="fw-semibold">
                    <Link href={`/admin/classes/${c.id}`}>{c.name}</Link>
                  </td>
                  <td className="text-muted">{c.description || "—"}</td>
                  <td>{c.subjectCount}</td>
                  <td>{c.enrolledStudentCount}</td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <Button size="sm" variant="outline-secondary" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setPendingDelete(c)}>
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

      <ClassCourseFormModal
        show={showForm}
        editing={editing}
        onClose={() => setShowForm(false)}
        onSaved={() => {
          setShowForm(false);
          load();
        }}
      />
      <ConfirmModal
        show={!!pendingDelete}
        title="Delete class/course"
        body={
          pendingDelete
            ? `Delete "${pendingDelete.name}"? This can't be undone and may affect existing subjects and enrollments.`
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
