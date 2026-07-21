import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';

/** Application shell for authenticated pages. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-b from-stone-100/70 to-background">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
