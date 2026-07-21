'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSignIcon, LifeBuoyIcon, LoaderCircleIcon, LockIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/components/auth-provider';
import { DemoAccounts } from '@/components/demo-accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/client';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      router.push('/tickets');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to log in');
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-amber-400 shadow-lg shadow-stone-900/25">
          <LifeBuoyIcon className="size-6" aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to manage your support tickets.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-stone-950/5 backdrop-blur-xl sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSignIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className="h-11 pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                className="h-11 pl-9"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer text-sm font-medium"
          >
            {isSubmitting && <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />}
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <DemoAccounts />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
