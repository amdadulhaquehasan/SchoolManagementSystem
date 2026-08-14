"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { subjectApi } from "@/lib/endpoints/subjects";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { normalizeError } from "@/lib/apiClient";
import type { ClassCourseDto, SubjectDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import ConfirmModal from "@/components/ConfirmModal";
import SubjectFormModal from "@/components/admin/SubjectFormModal";
import AssignTeacherModal from "@/components/admin/AssignTeacherModal";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [classCourses, setClassCourses] = useState<ClassCourseDto[]>([]);
  const [classFilter, setClassFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubjectDto | null>(null);
  const [assigning, setAssigning] = useState<SubjectDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubjectDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, classes] = await Promise.all([
        subjectApi.getAll(classFilter ? Number(classFilter) : undefined),
        classCourseApi.getAll(),
      ]);
      setSubjects(subs);
      setClassCourses(classes);
      setAssigning((prev) => (prev ? subs.find((s) => s.id === prev.id) ?? null : null));
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await subjectApi.remove(pendingDelete.id);
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
          <h1 className="h3 mb-1">Subjects</h1>
          <p className="text-muted mb-0">Manage subjects and assign teachers to them.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add Subject
        </Button>
      </div>

      <Form.Group className="mb-3" style={{ maxWidth: 320 }}>
        <Form.Label className="small text-muted text-uppercase fw-semibold">
          Filter by class/course
        </Form.Label>
        <Form.Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes/courses</option>
          {classCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <p className="text-muted">No subjects found.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Class / Course</th>
                <th>Assigned Teachers</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.name}</td>
                  <td>{s.classCourseName}</td>
                  <td>
                    {s.assignedTeachers.length === 0 ? (
                      <span className="text-muted">Unassigned</span>
                    ) : (
                      s.assignedTeachers.map((t) => (
                        <Badge bg="info" className="me-1" key={t.id}>
                          {t.fullName}
                        </Badge>
                      ))
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <Button size="sm" variant="outline-info" onClick={() => setAssigning(s)}>
                        Teachers
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setEditing(s);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setPendingDelete(s)}>
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

      <SubjectFormModal
        show={showForm}
        editing={editing}
        classCourses={classCourses}
        onClose={() => setShowForm(false)}
        onSaved={() => {
          setShowForm(false);
          load();
        }}
      />
      <AssignTeacherModal
        show={!!assigning}
        subject={assigning}
        onClose={() => setAssigning(null)}
        onSaved={load}
      />
      <ConfirmModal
        show={!!pendingDelete}
        title="Delete subject"
        body={pendingDelete ? `Delete "${pendingDelete.name}"? This can't be undone.` : ""}
        confirmLabel="Delete"
        isBusy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
