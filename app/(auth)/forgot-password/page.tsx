import type { Metadata } from 'next';
import { ForgotPasswordForm } from '../../../src/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset password | ArtistePulse',
  description: 'Request an ArtistePulse password-reset link.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Password recovery</p>
      <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Reset your password</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">Enter your email and we&apos;ll help you get back to your workspace.</p>
      <div className="mt-8"><ForgotPasswordForm /></div>
    </div>
  );
}
