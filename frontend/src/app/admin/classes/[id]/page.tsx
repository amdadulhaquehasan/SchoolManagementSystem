"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Card, Table } from "react-bootstrap";
import { classCourseApi } from "@/lib/endpoints/classCourses";
import { subjectApi } from "@/lib/endpoints/subjects";
import { normalizeError } from "@/lib/apiClient";
import type { ClassCourseDto, SubjectDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EnrollmentPanel from "@/components/admin/EnrollmentPanel";

export default function ClassCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classCourseId = Number(params.id);

  const [classCourse, setClassCourse] = useState<ClassCourseDto | null>(null);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cc, subs] = await Promise.all([
        classCourseApi.getById(classCourseId),
        subjectApi.getAll(classCourseId),
      ]);
      setClassCourse(cc);
      setSubjects(subs);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [classCourseId]);

  useEffect(() => {
    if (!Number.isNaN(classCourseId)) load();
  }, [classCourseId, load]);

  if (loading) return <LoadingSpinner label="Loading class/course..." />;

  return (
    <div className="py-2">
      <Button variant="link" className="px-0 mb-2" onClick={() => router.push("/admin/classes")}>
        &larr; Back to Classes &amp; Courses
      </Button>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {classCourse && (
        <>
          <div className="mb-4">
            <h1 className="h3 mb-1">{classCourse.name}</h1>
            <p className="text-muted mb-2">{classCourse.description || "No description provided."}</p>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="border">
                {classCourse.subjectCount} subject{classCourse.subjectCount === 1 ? "" : "s"}
              </Badge>
              <Badge bg="light" text="dark" className="border">
                {classCourse.enrolledStudentCount} student{classCourse.enrolledStudentCount === 1 ? "" : "s"} enrolled
              </Badge>
            </div>
          </div>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold">Subjects in this class/course</Card.Header>
            <Card.Body className="p-0">
              {subjects.length === 0 ? (
                <p className="text-muted p-3 mb-0">
                  No subjects yet. Go to{" "}
                  <a href="/admin/subjects">Subjects</a> to add one for this class/course.
                </p>
              ) : (
                <div className="table-responsive-wrapper">
                  <Table className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Assigned Teachers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold">Student Enrollment</Card.Header>
            <Card.Body>
              <EnrollmentPanel classCourseId={classCourseId} onChanged={load} />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
