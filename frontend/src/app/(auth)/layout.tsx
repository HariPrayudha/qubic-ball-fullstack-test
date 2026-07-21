import type { ReactNode } from 'react';

/**
 * Auth shell: a full-viewport, vertically and horizontally centered stage
 * with a warm stone gradient and soft gold glow.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-linear-to-br from-stone-100 via-background to-amber-50/60 px-4 py-10">
      {/* Decorative background glows (purely presentational) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-amber-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-stone-400/20 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
