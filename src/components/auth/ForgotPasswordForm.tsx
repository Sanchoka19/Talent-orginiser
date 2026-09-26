'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthField } from './AuthField';

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Enter your email address.');
      return;
    }
    if (!isEmail(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-[#dce8ff] bg-[#f5f8ff] p-6" role="status" aria-live="polite">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#dfeaff] text-[#2058d8]"><CheckCircle2 size={23} aria-hidden="true" /></span>
        <h2 className="font-display mt-5 text-2xl font-bold tracking-tight text-slate-950">Check your inbox</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">If an ArtistePulse account uses <span className="font-semibold text-slate-800">{email}</span>, it will receive a password-reset link.</p>
        <p className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">Email delivery will activate when secure account infrastructure is connected. This preview has not sent an email.</p>
        <Link href="/sign-in" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#2459d5] hover:text-[#123eae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e5eff]">
          <ArrowLeft size={16} aria-hidden="true" /> Return to sign in
        </Link>
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
        onChange={(value) => {
          setEmail(value);
          setError(undefined);
        }}
        error={error}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white outline-none transition hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <Mail size={19} aria-hidden="true" />}
        {isSubmitting ? 'Sending link…' : 'Send reset link'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Remembered your password?{' '}
        <Link href="/sign-in" className="font-bold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
