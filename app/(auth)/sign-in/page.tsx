import type { Metadata } from 'next';
import { SignInForm } from '../../../src/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign in | ArtistePulse',
  description: 'Sign in to ArtistePulse.',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Welcome back</p>
      <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Sign in to your workspace</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">Continue managing the people and details behind every great show.</p>
      <div className="mt-8"><SignInForm /></div>
    </div>
  );
}
