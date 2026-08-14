import { apiClient } from "@/lib/apiClient";
import type { CreateSubjectDto, SubjectDto } from "@/types/dtos";

export const subjectApi = {
  getAll: (classCourseId?: number) =>
    apiClient
      .get<SubjectDto[]>("/subjects", { params: classCourseId ? { classCourseId } : undefined })
      .then((r) => r.data),

  getById: (id: number) => apiClient.get<SubjectDto>(`/subjects/${id}`).then((r) => r.data),

  create: (dto: CreateSubjectDto) => apiClient.post<SubjectDto>("/subjects", dto).then((r) => r.data),

  update: (id: number, dto: CreateSubjectDto) =>
    apiClient.put<SubjectDto>(`/subjects/${id}`, dto).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/subjects/${id}`),

  assignTeacher: (id: number, teacherId: string) =>
    apiClient.post(`/subjects/${id}/teachers`, { teacherId }),

  unassignTeacher: (id: number, teacherId: string) =>
    apiClient.delete(`/subjects/${id}/teachers/${teacherId}`),
};
