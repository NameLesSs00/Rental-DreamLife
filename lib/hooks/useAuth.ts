"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";
import {
  useAuthStore,
  getCookie,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/stores/authStore";
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileResponse,
} from "@/lib/types/auth";

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await axiosInstance.post<LoginResponse>(
        "/api/auth/login",
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      if (data.isSuccess && data.data) {
        setAuth(data.data);
        router.push("/admin/dashboard");
      }
    },
    // Errors are handled by the calling component via mutation.error
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post<LogoutResponse>(
        "/api/auth/logout"
      );
      return data;
    },
    onSettled: () => {
      // Clear auth regardless of API response success/failure
      clearAuth();
      router.push("/admin/login");
    },
  });
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      const { data } = await axiosInstance.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        payload
      );
      return data;
    },
  });
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: ResetPasswordRequest) => {
      const { data } = await axiosInstance.post<ResetPasswordResponse>(
        "/api/auth/reset-password",
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      if (data.isSuccess) {
        router.push("/admin/login?reset=success");
      }
    },
  });
}

// ─── Change Password ──────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      const { data } = await axiosInstance.post<ChangePasswordResponse>(
        "/api/auth/change-password",
        payload
      );
      return data;
    },
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useProfile() {
  const { accessToken, refreshToken, profile } = useAuthStore();
  const hasToken = Boolean(
    accessToken ||
      refreshToken ||
      (typeof document !== "undefined" &&
        (getCookie(ACCESS_TOKEN_COOKIE) || getCookie(REFRESH_TOKEN_COOKIE)))
  );

  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ProfileResponse>(
        "/api/auth/profile"
      );
      return data.data;
    },
    // Gate on accessToken OR refreshToken — if accessToken expired,
    // the refresh token allows axiosInstance to silently refresh.
    enabled: hasToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: profile ?? undefined,
  });
}
