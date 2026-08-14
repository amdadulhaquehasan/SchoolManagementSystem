"use client";

import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/endpoints/admin";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { normalizeError } from "@/lib/apiClient";
import type { UserDto } from "@/types/dtos";
import ErrorAlert from "@/components/ErrorAlert";

export default function EnrollmentPanel({
  classCourseId,
  onChanged,
}: {
  classCourseId: number;
  onChanged: () => void;
}) {
  const [students, setStudents] = useState<UserDto[]>([]);
  const [selectedEnroll, setSelectedEnroll] = useState("");
  const [selectedUnenroll, setSelectedUnenroll] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getUsers("Student").then(setStudents).catch(() => setStudents([]));
  }, []);

  const handleEnroll = async () => {
    if (!selectedEnroll) return;
    setBusy(true);
    setError(null);
    try {
      await classCourseApi.enrollStudent(classCourseId, selectedEnroll);
      toast.success("Student enrolled.");
      setSelectedEnroll("");
      onChanged();
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const handleUnenroll = async () => {
    if (!selectedUnenroll) return;
    setBusy(true);
    setError(null);
    try {
      await classCourseApi.unenrollStudent(classCourseId, selectedUnenroll);
      toast.success("Student unenrolled.");
      setSelectedUnenroll("");
      onChanged();
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <ErrorAlert message={error} onDismiss={() => setError(null)} />
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Label className="fw-semibold small text-uppercase text-muted">Enroll a student</Form.Label>
          <div className="d-flex gap-2">
            <Form.Select value={selectedEnroll} onChange={(e) => setSelectedEnroll(e.target.value)}>
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.email})
                </option>
              ))}
            </Form.Select>
            <Button variant="primary" disabled={!selectedEnroll || busy} onClick={handleEnroll}>
              Enroll
            </Button>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <Form.Label className="fw-semibold small text-uppercase text-muted">Unenroll a student</Form.Label>
          <div className="d-flex gap-2">
            <Form.Select value={selectedUnenroll} onChange={(e) => setSelectedUnenroll(e.target.value)}>
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.email})
                </option>
              ))}
            </Form.Select>
            <Button variant="outline-danger" disabled={!selectedUnenroll || busy} onClick={handleUnenroll}>
              Unenroll
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
