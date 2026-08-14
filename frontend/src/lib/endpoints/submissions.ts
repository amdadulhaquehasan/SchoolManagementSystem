import { apiClient } from "@/lib/apiClient";
import type {
  ChangeSubmissionStatusDto,
  CreateSubmissionFormValues,
  GradeSubmissionDto,
  SubmissionDto,
  UpdateSubmissionFormValues,
} from "@/types/dtos";

function buildCreateForm(values: CreateSubmissionFormValues): FormData {
  const form = new FormData();
  if (values.TextAnswer) form.append("TextAnswer", values.TextAnswer);
  if (values.File && values.File.length > 0) form.append("File", values.File[0]);
  return form;
}

function buildUpdateForm(values: UpdateSubmissionFormValues): FormData {
  const form = new FormData();
  if (values.TextAnswer) form.append("TextAnswer", values.TextAnswer);
  form.append("RemoveExistingFile", String(values.RemoveExistingFile));
  if (values.File && values.File.length > 0) form.append("File", values.File[0]);
  return form;
}

export const submissionApi = {
  submit: (assignmentId: number, values: CreateSubmissionFormValues) =>
    apiClient
      .post<SubmissionDto>(`/assignments/${assignmentId}/submissions`, buildCreateForm(values), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id: number, values: UpdateSubmissionFormValues) =>
    apiClient
      .put<SubmissionDto>(`/submissions/${id}`, buildUpdateForm(values), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  getById: (id: number) => apiClient.get<SubmissionDto>(`/submissions/${id}`).then((r) => r.data),

  getMine: () => apiClient.get<SubmissionDto[]>("/submissions/my").then((r) => r.data),

  getByAssignment: (assignmentId: number) =>
    apiClient.get<SubmissionDto[]>(`/assignments/${assignmentId}/submissions`).then((r) => r.data),

  grade: (id: number, dto: GradeSubmissionDto) =>
    apiClient.put<SubmissionDto>(`/submissions/${id}/grade`, dto).then((r) => r.data),

  changeStatus: (id: number, dto: ChangeSubmissionStatusDto) =>
    apiClient.patch<SubmissionDto>(`/submissions/${id}/status`, dto).then((r) => r.data),
};
