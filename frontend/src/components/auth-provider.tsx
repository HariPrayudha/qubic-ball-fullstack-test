'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { sessionApi } from '@/lib/client';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = ['session'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: sessionApi.me,
    staleTime: 60_000,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await sessionApi.login(email, password);
      qc.setQueryData(SESSION_KEY, u);
      return u;
    },
    [qc],
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; password_confirmation: string }) => {
      const u = await sessionApi.register(payload);
      qc.setQueryData(SESSION_KEY, u);
      return u;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await sessionApi.logout();
    qc.setQueryData(SESSION_KEY, null);
    qc.clear();
  }, [qc]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
