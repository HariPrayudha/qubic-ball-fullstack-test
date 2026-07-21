'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AtSignIcon,
  LifeBuoyIcon,
  LoaderCircleIcon,
  LockIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/client';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values);
      toast.success('Account created!');
      router.push('/tickets');
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        // Surface server-side validation (e.g. email already taken).
        for (const [field, messages] of Object.entries(err.errors)) {
          setError(field as keyof FormValues, { message: messages[0] });
        }
        return;
      }
      toast.error(err instanceof ApiError ? err.message : 'Unable to register');
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
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Register to start opening support tickets.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-stone-950/5 backdrop-blur-xl sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <UserIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                className="h-11 pl-9"
                {...register('name')}
              />
            </div>
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                  className="h-11 pl-9"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm password</Label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={!!errors.password_confirmation}
                  className="h-11 pl-9"
                  {...register('password_confirmation')}
                />
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer text-sm font-medium"
          >
            {isSubmitting && <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />}
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
