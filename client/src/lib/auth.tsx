import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "./queryClient";
import type { Brand } from "@shared/schema";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activeBrand: (Brand & { role: string }) | null;
  setActiveBrand: (brand: (Brand & { role: string }) | null) => void;
  brands: (Brand & { role: string })[];
  brandsLoading: boolean;
  refetchBrands: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [activeBrand, setActiveBrandState] = useState<
    (Brand & { role: string }) | null
  >(null);

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
  });

  const {
    data: brands = [],
    isLoading: brandsLoading,
    refetch: refetchBrands,
  } = useQuery<(Brand & { role: string })[]>({
    queryKey: ["/api/brands"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const manualClearRef = useRef(false);

  useEffect(() => {
    if (brands.length > 0 && !activeBrand && !manualClearRef.current) {
      const savedBrandId = localStorage.getItem("activeBrandId");
      const savedBrand = brands.find((b) => b.id === savedBrandId);
      setActiveBrandState(savedBrand || brands[0]);
    }
  }, [brands, activeBrand]);

  const setActiveBrand = useCallback(
    (brand: (Brand & { role: string }) | null) => {
      setActiveBrandState(brand);
      if (brand) {
        manualClearRef.current = false;
        localStorage.setItem("activeBrandId", brand.id);
      } else {
        manualClearRef.current = true;
        localStorage.removeItem("activeBrandId");
      }
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      const userData = await res.json();
      queryClient.setQueryData(["/api/auth/me"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
    [queryClient],
  );

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const res = await apiRequest("POST", "/api/auth/register", {
        email,
        name,
        password,
      });
      const userData = await res.json();
      queryClient.setQueryData(["/api/auth/me"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.setQueryData(["/api/auth/me"], null);
    setActiveBrandState(null);
    manualClearRef.current = false;
    localStorage.removeItem("activeBrandId");
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        activeBrand,
        setActiveBrand,
        brands,
        brandsLoading,
        refetchBrands,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
