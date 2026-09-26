import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { AuthBrand } from '../../src/components/auth/AuthBrand';

function ProductPanel() {
  return (
    <section className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#173a9b] px-8 py-10 text-white md:flex md:flex-col lg:px-10 xl:px-16">
      <div className="absolute -left-24 top-20 size-96 rounded-full bg-[#4979ef]/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 right-0 size-[520px] rounded-full bg-[#79b6ff]/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-center gap-3 text-lg font-bold tracking-tight">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#1e5eff] shadow-lg shadow-blue-950/15"><Sparkles size={20} /></span>
        ArtistePulse
      </div>

      <div className="relative my-auto max-w-xl py-16">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ceff]">One workspace for every show</p>
        <h1 className="font-display mt-5 max-w-lg text-5xl font-bold leading-[1.05] tracking-[-0.05em] xl:text-6xl">The details behind a great performance, in sync.</h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-[#d5e2ff]">Plan the roster, coordinate the venue, and keep your whole show day moving with confidence.</p>

        <div className="mt-12 max-w-[490px] rounded-[22px] border border-white/20 bg-white/10 p-3 shadow-[0_26px_70px_rgba(4,25,85,0.28)] backdrop-blur-md">
          <div className="overflow-hidden rounded-[14px] bg-[#f7f9ff] text-slate-900">
            <div className="flex h-11 items-center justify-between border-b border-[#e5ebf8] bg-white px-4">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold"><span className="flex size-5 items-center justify-center rounded-md bg-[#1e5eff] text-[9px] text-white">A</span>ArtistePulse</span>
              <span className="rounded-full bg-[#edf2ff] px-2 py-1 text-[9px] font-bold text-[#2858ca]">Today</span>
            </div>
            <div className="grid grid-cols-[94px_1fr]">
              <aside className="border-r border-[#e5ebf8] bg-white px-3 py-4">
                <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">Workspace</p>
                <div className="space-y-1 text-[9px] font-medium text-slate-500">
                  {['Overview', 'Talent', 'Groups', 'Venues', 'Calendar'].map((item, index) => (
                    <div key={item} className={`rounded-md px-2 py-1.5 ${index === 0 ? 'bg-[#eaf0ff] font-bold text-[#2457ce]' : ''}`}>{item}</div>
                  ))}
                </div>
              </aside>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div><p className="text-[9px] font-medium text-slate-400">Monday, 24 June</p><h2 className="mt-1 text-sm font-bold tracking-tight">Your show day</h2></div>
                  <CalendarDays size={16} className="text-[#5d83eb]" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[#e8edf8] bg-white p-2.5"><UsersRound size={13} className="text-[#3467dc]" /><p className="mt-2 text-base font-bold">24</p><p className="text-[8px] text-slate-500">Active talent</p></div>
                  <div className="rounded-lg border border-[#e8edf8] bg-white p-2.5"><CheckCircle2 size={13} className="text-[#16806c]" /><p className="mt-2 text-base font-bold">06</p><p className="text-[8px] text-slate-500">Shows this week</p></div>
                </div>
                <div className="mt-2 rounded-lg border border-[#e8edf8] bg-white p-2.5">
                  <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold text-slate-700"><Clock3 size={11} className="text-[#5a7de1]" /> Today&apos;s schedule</p>
                  <div className="flex items-center gap-2 rounded-md bg-[#fafbff] px-2 py-1.5"><span className="size-1.5 rounded-full bg-[#d9e5ff]" /><span className="text-[8px] font-semibold text-slate-500">18:30</span><span className="text-[9px] font-bold text-slate-700">Harbour Lights</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative text-sm text-[#b7ceff]">Built for organisers, agencies, and venue teams.</p>
    </section>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white font-marketing text-slate-950 md:flex">
      <ProductPanel />
      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 sm:py-9 md:w-1/2 md:px-8 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between">
          <span className="md:hidden"><AuthBrand /></span>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#1e5eff]">
            <ArrowLeft size={16} aria-hidden="true" /> Back to home
          </Link>
        </header>
        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
          {children}
        </div>
      </section>
    </main>
  );
}
