'use client';

import Link from 'next/link';
import { CheckCircle2, LoaderCircle, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthField } from './AuthField';

type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof FormErrors) => (value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = 'Enter your full name.';
    if (!email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!isEmail(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';

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
          Your details were checked in this browser only. Authentication is not connected yet, so no account was created.
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
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <AuthField
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Avery Morgan"
        value={name}
        onChange={updateField('name')}
        error={errors.name}
      />
      <AuthField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={updateField('email')}
        error={errors.email}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={updateField('password')}
        error={errors.password}
      />
      <p className="-mt-2 text-xs leading-5 text-slate-500">Use 8 or more characters. Final password requirements will follow the selected sign-in provider.</p>
      <AuthField
        label="Confirm password"
        name="confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={updateField('confirmPassword')}
        error={errors.confirmPassword}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white outline-none transition hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <Sparkles size={19} aria-hidden="true" />}
        {isSubmitting ? 'Checking details…' : 'Create account'}
      </button>
      <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <UserRound className="mt-0.5 shrink-0 text-slate-500" size={15} aria-hidden="true" />
        This preview does not collect account details or create workspace access.
      </p>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-bold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
