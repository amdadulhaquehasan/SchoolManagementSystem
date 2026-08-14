import { apiClient } from "@/lib/apiClient";
import type { ClassCourseDto, CreateClassCourseDto } from "@/types/dtos";

export const classCourseApi = {
  getAll: () => apiClient.get<ClassCourseDto[]>("/classcourses").then((r) => r.data),

  getById: (id: number) => apiClient.get<ClassCourseDto>(`/classcourses/${id}`).then((r) => r.data),

  create: (dto: CreateClassCourseDto) =>
    apiClient.post<ClassCourseDto>("/classcourses", dto).then((r) => r.data),

  update: (id: number, dto: CreateClassCourseDto) =>
    apiClient.put<ClassCourseDto>(`/classcourses/${id}`, dto).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/classcourses/${id}`),

  enrollStudent: (id: number, studentId: string) =>
    apiClient.post(`/classcourses/${id}/students`, { studentId }),

  unenrollStudent: (id: number, studentId: string) =>
    apiClient.delete(`/classcourses/${id}/students/${studentId}`),
};
