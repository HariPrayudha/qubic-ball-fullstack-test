'use client';

import { LifeBuoyIcon, LoaderCircleIcon, LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/client';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click (touch devices) and on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to sign out');
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/tickets"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-amber-400 shadow-md shadow-stone-900/20">
            <LifeBuoyIcon className="size-5" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Qubic Support
          </span>
        </Link>

        {user && (
          <div
            ref={containerRef}
            className="relative"
            // Hover reveals on pointer devices; touch devices fall back to tap.
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-controls="user-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                // Symmetric padding on mobile (avatar only); extra right
                // padding from sm: up, where the name/email is visible.
                'flex cursor-pointer items-center gap-2.5 rounded-full border bg-white/80 p-1.5 shadow-sm sm:pr-3',
                'transition-all duration-200 hover:border-primary/30 hover:bg-white hover:shadow',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                menuOpen && 'border-primary/30 bg-white shadow',
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-stone-700 to-stone-950 text-[11px] font-semibold text-amber-300 ring-2 ring-white"
                aria-hidden
              >
                {initials(user.name)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium">{user.name}</span>
                <span className="block text-xs text-muted-foreground">{user.email}</span>
              </span>
              <span className="sr-only">Account menu</span>
            </button>

            {/* Dropdown: absolutely positioned so revealing it never shifts layout. */}
            <div
              id="user-menu"
              role="menu"
              aria-label="Account"
              className={cn(
                'absolute top-full right-0 z-40 w-max max-w-56 min-w-36 origin-top-right pt-1.5',
                'transition-all duration-200',
                menuOpen
                  ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                  : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
              )}
            >
              <div className="rounded-lg border bg-popover p-1 shadow-lg shadow-stone-900/10">
                <div className="border-b px-2 pt-0.5 pb-1.5 sm:hidden">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  tabIndex={menuOpen ? 0 : -1}
                  className={cn(
                    'w-full cursor-pointer justify-start max-sm:mt-1',
                    'text-destructive hover:bg-destructive/10 hover:text-destructive',
                  )}
                >
                  {loggingOut ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <LogOutIcon className="size-4" aria-hidden />
                  )}
                  {loggingOut ? 'Signing out…' : 'Log out'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
