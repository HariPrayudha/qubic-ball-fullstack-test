'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import {
  canCopyProgrammatically,
  copyToClipboard,
  selectElementContents,
} from '@/lib/clipboard';
import { cn } from '@/lib/utils';

const ACCOUNTS = [
  { role: 'Admin', username: 'admin@qubic.test', password: 'password' },
  { role: 'Customer', username: 'alice@qubic.test', password: 'password' },
] as const;

/**
 * Seeded credentials for reviewers.
 *
 * Where the Clipboard API is available (HTTPS / localhost) a tap copies
 * directly. Otherwise — e.g. iOS Safari reaching the dev server over a LAN IP,
 * which is not a secure context — the value is selected instead so the native
 * "Copy" bubble can be used. We never claim a copy we cannot verify.
 */
/** Never re-subscribes: the capability cannot change during a session. */
const noopSubscribe = () => () => {};

export function DemoAccounts() {
  // Client-only capability read without a hydration mismatch: the server
  // snapshot assumes copying works, the client corrects it after hydration.
  const canCopy = useSyncExternalStore(noopSubscribe, canCopyProgrammatically, () => true);

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-stone-200 bg-stone-100/70 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-secondary-foreground">Demo accounts</p>
        <p className="text-[11px] text-muted-foreground">
          {canCopy ? 'Click a value to copy' : 'Tap a value, then Copy'}
        </p>
      </div>

      <div className="space-y-3">
        {ACCOUNTS.map((account) => (
          <div key={account.role} className="space-y-1.5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {account.role}
            </p>
            <CopyField
              label="Username"
              value={account.username}
              srLabel={`Copy ${account.role} username`}
              canCopy={canCopy}
            />
            <CopyField
              label="Password"
              value={account.password}
              srLabel={`Copy ${account.role} password`}
              canCopy={canCopy}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyField({
  label,
  value,
  srLabel,
  canCopy,
}: {
  label: string;
  value: string;
  srLabel: string;
  canCopy: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const valueRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    if (canCopy && (await copyToClipboard(value))) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
      return;
    }

    // Insecure context (or a rejected write): select the text so the platform's
    // own Copy action can take over, and say so plainly.
    if (valueRef.current) selectElementContents(valueRef.current);
    toast.info('Selected — use Copy from your device');
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-2',
        'transition-colors duration-200 focus-within:border-primary/40 hover:border-primary/40',
      )}
    >
      <span className="w-14 shrink-0 text-[11px] font-medium text-muted-foreground sm:w-16">
        {label}
      </span>

      {/* `select-all` makes a single tap select the whole value on iOS. */}
      <span
        ref={valueRef}
        onClick={handleCopy}
        className="min-w-0 flex-1 cursor-pointer truncate font-mono text-xs text-foreground select-all"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={srLabel}
        className={cn(
          'flex min-h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium',
          'transition-colors duration-200 hover:bg-stone-100',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          copied ? 'text-emerald-600' : 'text-muted-foreground group-hover:text-primary',
        )}
      >
        {copied ? (
          <>
            <CheckIcon className="size-3.5" aria-hidden />
            Copied
          </>
        ) : (
          <CopyIcon className="size-3.5" aria-hidden />
        )}
      </button>

      <span aria-live="polite" className="sr-only">
        {copied ? `${label} copied to clipboard` : ''}
      </span>
    </div>
  );
}
