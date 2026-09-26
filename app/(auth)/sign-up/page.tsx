import type { Metadata } from 'next';
import { SignUpForm } from '../../../src/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Create account | ArtistePulse',
  description: 'Create an ArtistePulse account.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Get started</p>
      <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Create your workspace</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">Start with the essentials. Profile and team details can come later.</p>
      <div className="mt-7"><SignUpForm /></div>
    </div>
  );
}
