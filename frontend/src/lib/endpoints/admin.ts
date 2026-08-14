import { apiClient } from "@/lib/apiClient";
import type { CreateStudentDto, CreateTeacherDto, UserDto } from "@/types/dtos";

export const adminApi = {
  createTeacher: (dto: CreateTeacherDto) =>
    apiClient.post<UserDto>("/admin/teachers", dto).then((r) => r.data),

  createStudent: (dto: CreateStudentDto) =>
    apiClient.post<UserDto>("/admin/students", dto).then((r) => r.data),

  getUsers: (role?: string) =>
    apiClient
      .get<UserDto[]>("/admin/users", { params: role ? { role } : undefined })
      .then((r) => r.data),

  getUser: (userId: string) =>
    apiClient.get<UserDto>(`/admin/users/${userId}`).then((r) => r.data),

  activate: (userId: string) => apiClient.put(`/admin/users/${userId}/activate`),

  deactivate: (userId: string) => apiClient.put(`/admin/users/${userId}/deactivate`),

  deleteUser: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
};
