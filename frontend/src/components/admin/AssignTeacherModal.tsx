"use client";

import { useEffect, useState } from "react";
import { Button, Form, ListGroup, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/endpoints/admin";
import { subjectApi } from "@/lib/endpoints/subjects";
import { normalizeError } from "@/lib/apiClient";
import ErrorAlert from "@/components/ErrorAlert";
import type { SubjectDto, UserDto } from "@/types/dtos";

export default function AssignTeacherModal({
  show,
  subject,
  onClose,
  onSaved,
}: {
  show: boolean;
  subject: SubjectDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [teachers, setTeachers] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyTeacherId, setBusyTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    adminApi
      .getUsers("Teacher")
      .then(setTeachers)
      .catch((err) => setError(normalizeError(err).message))
      .finally(() => setLoading(false));
  }, [show]);

  if (!subject) return null;

  const isAssigned = (t: UserDto) => subject.assignedTeachers.some((a) => a.id === t.id);

  const toggle = async (teacher: UserDto) => {
    setBusyTeacherId(teacher.id);
    setError(null);
    try {
      if (isAssigned(teacher)) {
        await subjectApi.unassignTeacher(subject.id, teacher.id);
        toast.info(`${teacher.firstName} ${teacher.lastName} unassigned from ${subject.name}.`);
      } else {
        await subjectApi.assignTeacher(subject.id, teacher.id);
        toast.success(`${teacher.firstName} ${teacher.lastName} assigned to ${subject.name}.`);
      }
      onSaved();
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setBusyTeacherId(null);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">Assign Teachers — {subject.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : teachers.length === 0 ? (
          <p className="text-muted mb-0">No teacher accounts exist yet.</p>
        ) : (
          <ListGroup>
            {teachers.map((t) => (
              <ListGroup.Item key={t.id} className="d-flex justify-content-between align-items-center">
                <span>
                  {t.firstName} {t.lastName}
                  <span className="text-muted small ms-2">{t.email}</span>
                </span>
                <Form.Check
                  type="switch"
                  checked={isAssigned(t)}
                  disabled={busyTeacherId === t.id}
                  onChange={() => toggle(t)}
                  label={isAssigned(t) ? "Assigned" : "Assign"}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
