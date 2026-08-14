"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/endpoints/auth";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY, normalizeError } from "@/lib/apiClient";
import type { AuthResponseDto, LoginDto, Role } from "@/types/dtos";

export interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<CurrentUser>;
  logout: () => void;
  homeRouteFor: (role: Role) => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toCurrentUser(res: AuthResponseDto): CurrentUser {
  return { userId: res.userId, email: res.email, fullName: res.fullName, role: res.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (rawUser && token) {
      try {
        setUser(JSON.parse(rawUser) as CurrentUser);
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    try {
      const res = await authApi.login(dto);
      const current = toCurrentUser(res);
      window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(current));
      setUser(current);
      return current;
    } catch (err) {
      throw normalizeError(err);
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  const homeRouteFor = useCallback((role: Role) => {
    switch (role) {
      case "Admin":
        return "/admin/users";
      case "Teacher":
        return "/teacher";
      case "Student":
        return "/student";
      default:
        return "/login";
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, homeRouteFor }),
    [user, isLoading, login, logout, homeRouteFor]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
