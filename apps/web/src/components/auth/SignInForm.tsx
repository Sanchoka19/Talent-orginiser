'use client';

import Link from 'next/link';
import { CheckCircle2, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthField } from './AuthField';

type FormErrors = Partial<Record<'email' | 'password', string>>;

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateEmail = (value: string) => {
    setEmail(value);
    setErrors((current) => ({ ...current, email: undefined }));
  };
  const updatePassword = (value: string) => {
    setPassword(value);
    setErrors((current) => ({ ...current, password: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!isEmail(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={34} aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-950">Form preview complete</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Your details were checked in this browser only. Authentication is not connected yet, so no account or session was created.
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="mt-5 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-slate-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <AuthField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={updateEmail}
        error={errors.email}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={updatePassword}
        error={errors.password}
      />
      <div className="flex justify-end -mt-2">
        <Link href="/forgot-password" className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white outline-none transition hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <LockKeyhole size={19} aria-hidden="true" />}
        {isSubmitting ? 'Checking details…' : 'Sign in'}
      </button>
      <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <Mail className="mt-0.5 shrink-0 text-slate-500" size={15} aria-hidden="true" />
        This is a design preview. Sign-in will be available once secure account infrastructure is configured.
      </p>
      <p className="text-center text-sm text-slate-600">
        New to ArtistePulse?{' '}
        <Link href="/sign-up" className="font-bold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}
