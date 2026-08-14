import { apiClient } from "@/lib/apiClient";
import type {
  AssignmentDto,
  ChangeAssignmentStatusDto,
  CreateAssignmentFormValues,
  UpdateAssignmentFormValues,
} from "@/types/dtos";

function buildCreateForm(values: CreateAssignmentFormValues): FormData {
  const form = new FormData();
  form.append("Title", values.Title);
  if (values.Description) form.append("Description", values.Description);
  form.append("DeadlineUtc", new Date(values.DeadlineUtc).toISOString());
  form.append("MaxMarks", String(values.MaxMarks));
  form.append("SubjectId", String(values.SubjectId));
  form.append("ClassCourseId", String(values.ClassCourseId));
  form.append("Publish", String(values.Publish));
  if (values.File && values.File.length > 0) form.append("File", values.File[0]);
  return form;
}

function buildUpdateForm(values: UpdateAssignmentFormValues): FormData {
  const form = new FormData();
  form.append("Title", values.Title);
  if (values.Description) form.append("Description", values.Description);
  form.append("DeadlineUtc", new Date(values.DeadlineUtc).toISOString());
  form.append("MaxMarks", String(values.MaxMarks));
  form.append("RemoveExistingFile", String(values.RemoveExistingFile));
  if (values.File && values.File.length > 0) form.append("File", values.File[0]);
  return form;
}

export const assignmentApi = {
  getAll: () => apiClient.get<AssignmentDto[]>("/assignments").then((r) => r.data),

  getById: (id: number) => apiClient.get<AssignmentDto>(`/assignments/${id}`).then((r) => r.data),

  create: (values: CreateAssignmentFormValues) =>
    apiClient
      .post<AssignmentDto>("/assignments", buildCreateForm(values), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id: number, values: UpdateAssignmentFormValues) =>
    apiClient
      .put<AssignmentDto>(`/assignments/${id}`, buildUpdateForm(values), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  changeStatus: (id: number, dto: ChangeAssignmentStatusDto) =>
    apiClient.patch<AssignmentDto>(`/assignments/${id}/status`, dto).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/assignments/${id}`),
};
