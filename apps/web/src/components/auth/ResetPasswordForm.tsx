'use client';

import Link from 'next/link';
import { CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthField } from './AuthField';

type Errors = Partial<Record<'password' | 'confirmation', string>>;

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!confirmation) nextErrors.confirmation = 'Confirm your new password.';
    else if (confirmation !== password) nextErrors.confirmation = 'Passwords do not match.';

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
      <div className="rounded-2xl border border-[#dce8ff] bg-[#f5f8ff] p-6" role="status" aria-live="polite">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#dfeaff] text-[#2058d8]"><CheckCircle2 size={23} aria-hidden="true" /></span>
        <h2 className="font-display mt-5 text-2xl font-bold tracking-tight text-slate-950">Password reset ready</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your new password passed the client-side checks. Connect this form to the account provider to save it securely.</p>
        <Link href="/sign-in" className="mt-6 inline-flex rounded-xl bg-[#1e5eff] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#164bd7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Return to sign in</Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <AuthField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(value) => {
          setPassword(value);
          setErrors((current) => ({ ...current, password: undefined }));
        }}
        error={errors.password}
      />
      <p className="-mt-2 text-xs leading-5 text-slate-500">Use 8 or more characters. Final requirements follow the selected sign-in provider.</p>
      <AuthField
        label="Confirm new password"
        name="confirmation"
        type="password"
        autoComplete="new-password"
        value={confirmation}
        onChange={(value) => {
          setConfirmation(value);
          setErrors((current) => ({ ...current, confirmation: undefined }));
        }}
        error={errors.confirmation}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white outline-none transition hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <KeyRound size={19} aria-hidden="true" />}
        {isSubmitting ? 'Saving password…' : 'Reset password'}
      </button>
    </form>
  );
}
