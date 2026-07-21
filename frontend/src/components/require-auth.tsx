'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Client-side guard: shows a loading placeholder while the session is
 * resolving and redirects unauthenticated users to the login page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-72 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
