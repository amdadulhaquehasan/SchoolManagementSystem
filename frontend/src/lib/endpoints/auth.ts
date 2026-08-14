import { apiClient } from "@/lib/apiClient";
import type { AuthResponseDto, LoginDto } from "@/types/dtos";

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<AuthResponseDto>("/Auth/login", dto).then((r) => r.data),
};
