import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AuthBrand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 rounded-lg text-slate-950 outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
      aria-label="ArtistePulse home"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
        <Sparkles size={20} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">ArtistePulse</span>
    </Link>
  );
}
