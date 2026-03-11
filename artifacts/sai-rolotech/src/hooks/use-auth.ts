import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

type AuthUser = {
  id: string;
  username: string;
  email: string | null;
  name: string;
  phone: string;
  role: string;
  companyName: string | null;
  gstNo: string | null;
  location: string | null;
  state: string | null;
  machineSpecialization: string | null;
  isVerified: boolean | null;
  isApproved: boolean | null;
  isEmailVerified: boolean | null;
  twoFactorEnabled: boolean | null;
  allowedDevices: string[] | null;
  lastDeviceFingerprint: string | null;
  warningCount: number | null;
  isFrozen: boolean | null;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        ...data,
        deviceFingerprint: navigator.userAgent,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      password: string;
      email?: string;
      name: string;
      phone: string;
      role?: string;
      companyName?: string;
      gstNo?: string;
      location?: string;
      state?: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "sub_admin",
    isSuperAdmin: user?.role === "admin",
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
