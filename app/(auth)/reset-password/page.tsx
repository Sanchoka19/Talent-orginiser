import type { Metadata } from 'next';
import { ResetPasswordForm } from '../../../src/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Choose a new password | ArtistePulse',
  description: 'Choose a new ArtistePulse password.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Password recovery</p>
      <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Choose a new password</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">Create a secure password you haven&apos;t used elsewhere.</p>
      <div className="mt-8"><ResetPasswordForm /></div>
    </div>
  );
}
