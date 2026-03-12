import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithCustomToken } from "firebase/auth";

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
  failedLoginAttempts: number | null;
  accountLockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
};

type LoginResponse = AuthUser & { customToken?: string } | { requires2FA: true; email: string };

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      let firebaseToken: string | undefined;

      if (data.username.includes("@")) {
        try {
          const cred = await signInWithEmailAndPassword(auth, data.username, data.password);
          firebaseToken = await cred.user.getIdToken();
        } catch {}
      }

      const res = await apiRequest("POST", "/api/auth/login", {
        ...data,
        firebaseToken,
        deviceFingerprint: navigator.userAgent,
      });
      const result = await res.json() as LoginResponse;

      if ("customToken" in result && result.customToken && !firebaseToken) {
        try {
          await signInWithCustomToken(auth, result.customToken);
        } catch {}
      }

      return result;
    },
    onSuccess: (data) => {
      if (!("requires2FA" in data)) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-2fa", {
        ...data,
        deviceFingerprint: navigator.userAgent,
      });
      const result = await res.json() as AuthUser & { customToken?: string };

      if (result.customToken) {
        try {
          await signInWithCustomToken(auth, result.customToken);
        } catch {}
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const toggle2FAMutation = useMutation({
    mutationFn: async (data: { enabled: boolean }) => {
      const res = await apiRequest("POST", "/api/auth/toggle-2fa", data);
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
      let firebaseToken: string | undefined;

      const email = data.email || (data.username.includes("@") ? data.username : undefined);
      if (email) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, data.password);
          firebaseToken = await cred.user.getIdToken();
        } catch {}
      }

      const res = await apiRequest("POST", "/api/auth/register", {
        ...data,
        firebaseToken,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await signOut(auth);
      } catch {}
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
    isVendor: user?.role === "vendor",
    isSupplier: user?.role === "supplier",
    isAssemblyHead: user?.role === "assembly_head" || user?.role === "admin",
    isEngineer: user?.role === "engineer" || user?.role === "admin" || user?.role === "sub_admin",
    login: loginMutation,
    verify2FA: verify2FAMutation,
    toggle2FA: toggle2FAMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
