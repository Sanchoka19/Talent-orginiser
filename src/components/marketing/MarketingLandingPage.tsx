'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Layers3,
  Menu,
  Music2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'For teams', href: '#teams' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const audienceCards = [
  {
    icon: UsersRound,
    title: 'Talent agencies',
    description: 'Keep every artist, contract, availability note, and performance detail in one organised home.',
    accent: 'bg-[#e9efff] text-[#2357d9]',
  },
  {
    icon: Music2,
    title: 'Show organisers',
    description: 'Build the right cast, coordinate duties, and know exactly what needs to happen before curtain up.',
    accent: 'bg-[#e8f7f2] text-[#09765c]',
  },
  {
    icon: Building2,
    title: 'Venue teams',
    description: 'Bring venue details, running orders, and day-of-show information into a shared view.',
    accent: 'bg-[#fff1e9] text-[#c65320]',
  },
];

const features = [
  {
    number: '01',
    eyebrow: 'A clear roster',
    title: 'Know your talent at a glance.',
    description: 'Build rich artist profiles, keep important documents close, and find the right people without searching through scattered spreadsheets.',
    items: ['Central artist profiles', 'Contract and document context', 'Fast filters for every roster'],
  },
  {
    number: '02',
    eyebrow: 'Shows in sync',
    title: 'Plan every performance with confidence.',
    description: 'Bring venues, groups, schedules, and show details together so the whole team works from the same plan.',
    items: ['Venue and group coordination', 'Calendar views for every horizon', 'One source for show details'],
  },
  {
    number: '03',
    eyebrow: 'Less last-minute work',
    title: 'Spot conflicts before they become problems.',
    description: 'See the moving pieces clearly and make duty rotations easier to manage across your programme.',
    items: ['Schedule conflict visibility', 'Balanced duty rotation', 'Clear daily responsibilities'],
  },
];

const faqs = [
  {
    question: 'Who is ArtistePulse for?',
    answer: 'ArtistePulse is designed for talent agencies, show organisers, production teams, and venue teams coordinating artists and live performances.',
  },
  {
    question: 'What can I organise with it?',
    answer: 'You can organise talent records, groups, venues, contracts, schedules, show details, responsibilities, and day-to-day coordination.',
  },
  {
    question: 'Do I need to be technical to use it?',
    answer: 'No. The product is built around the work your team already does: keeping a roster, planning a show, and making sure every detail is accounted for.',
  },
  {
    question: 'Can my team use the same workspace?',
    answer: 'The workspace is designed to give teams a shared operational view. Account and collaboration setup will guide how people join and use it together.',
  },
];

function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-[-0.04em]">
      <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${inverted ? 'bg-white text-[#1e4fcc]' : 'bg-[#1e5eff] text-white'}`}>
        <Sparkles size={16} strokeWidth={2.8} aria-hidden="true" />
      </span>
      <span className={inverted ? 'text-white' : 'text-[#111827]'}>ArtistePulse</span>
    </span>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[660px] rounded-[26px] border border-slate-200 bg-white p-2.5 shadow-[0_28px_80px_rgba(32,53,100,0.18)]">
      <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-[#f8faff]">
        <div className="flex h-12 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1e5eff] text-[9px] text-white">A</span>
            ArtistePulse
          </div>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-200" />
            <span className="h-2 w-2 rounded-full bg-slate-200" />
            <span className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="grid min-h-[335px] grid-cols-[112px_1fr] sm:grid-cols-[138px_1fr]">
          <aside className="border-r border-slate-100 bg-white px-2.5 py-4 sm:px-3.5">
            <div className="mb-5 hidden text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">Workspace</div>
            <div className="space-y-1.5 text-[9px] font-medium text-slate-500 sm:text-[10px]">
              {['Overview', 'Talent', 'Groups', 'Venues', 'Calendar'].map((item, index) => (
                <div key={item} className={`rounded-md px-2 py-1.5 ${index === 0 ? 'bg-[#edf2ff] font-semibold text-[#2258db]' : ''}`}>{item}</div>
              ))}
            </div>
            <div className="mt-8 rounded-lg bg-[#111b36] p-2.5 text-white">
              <Sparkles size={13} className="mb-2 text-[#83a8ff]" />
              <p className="text-[9px] font-semibold leading-snug sm:text-[10px]">Your next show is ready.</p>
            </div>
          </aside>
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">Monday, 24 June</p>
                <h3 className="mt-1 text-sm font-bold tracking-tight text-slate-900 sm:text-base">Good morning, Maya</h3>
              </div>
              <span className="rounded-md bg-[#1e5eff] px-2.5 py-1.5 text-[9px] font-semibold text-white sm:text-[10px]">Add show</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ['24', 'Active talent', 'bg-[#eef3ff] text-[#2258db]'],
                ['06', 'Shows this week', 'bg-[#eaf8f4] text-[#08795f]'],
                ['03', 'Needs review', 'bg-[#fff4ed] text-[#bf5926]'],
              ].map(([value, label, color]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-white p-2.5 shadow-[0_2px_7px_rgba(36,57,100,0.04)] sm:p-3">
                  <span className={`mb-2 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${color}`}>{value}</span>
                  <p className="text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]">{label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-800 sm:text-xs">Today&apos;s schedule</h4>
                  <p className="mt-0.5 text-[8px] text-slate-400 sm:text-[9px]">Three details need your attention</p>
                </div>
                <CalendarDays size={14} className="text-[#6c8df4]" />
              </div>
              <div className="space-y-2">
                {[
                  ['18:30', 'Harbour Lights', 'Atrium Hotel', 'bg-[#dce7ff]'],
                  ['20:00', 'Velvet Sessions', 'Riverside Stage', 'bg-[#dff5ed]'],
                  ['21:30', 'Late Set', 'Casa Verde', 'bg-[#fff0df]'],
                ].map(([time, name, venue, dot]) => (
                  <div key={name} className="flex items-center gap-2.5 rounded-lg bg-[#fafbfe] px-2.5 py-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <span className="w-8 text-[8px] font-semibold text-slate-500 sm:text-[9px]">{time}</span>
                    <span className="min-w-0 flex-1 text-[9px] font-semibold text-slate-700 sm:text-[10px]">{name}</span>
                    <span className="hidden text-[8px] text-slate-400 sm:block">{venue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_14px_38px_rgba(30,55,103,0.16)] sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf8f4] text-[#078469]"><Check size={16} strokeWidth={3} /></span>
          <div><p className="text-[10px] font-bold text-slate-800">Everything in place</p><p className="text-[9px] text-slate-500">Tonight&apos;s show is confirmed</p></div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold tracking-[-0.02em] text-slate-900 transition-colors hover:text-[#1e5eff] sm:py-6 sm:text-lg"
      >
        {question}
        <ChevronDown size={20} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1e5eff]' : 'text-slate-400'}`} />
      </button>
      {isOpen && <p className="max-w-2xl pb-5 text-sm leading-7 text-slate-600 sm:pb-6 sm:text-base">{answer}</p>}
    </div>
  );
}

export function MarketingLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fdfdff] font-marketing text-slate-900 selection:bg-[#dbe6ff] selection:text-[#163fa3]">
      <header className="relative z-30 mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#top" aria-label="ArtistePulse home"><BrandMark /></a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">{item.label}</a>)}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <a href="/sign-in" className="text-sm font-semibold text-slate-700 transition-colors hover:text-[#1e5eff]">Sign in</a>
          <a href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-[#1e5eff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(30,94,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#164bd7]">Create account <ArrowRight size={15} /></a>
        </div>
        <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation" aria-expanded={isMenuOpen}>
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        {isMenuOpen && (
          <div className="absolute left-5 right-5 top-[64px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden">
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {navItems.map((item) => <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{item.label}</a>)}
              <hr className="my-2 border-slate-100" />
              <a href="/sign-in" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">Sign in</a>
              <a href="/sign-up" onClick={closeMenu} className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e5eff] px-4 py-3 text-sm font-semibold text-white">Create account <ArrowRight size={15} /></a>
            </nav>
          </div>
        )}
      </header>

      <section id="top" className="relative isolate overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-18 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(ellipse_75%_52%_at_51%_35%,rgba(214,225,255,0.9),rgba(249,251,255,0.4)_47%,transparent_74%)]" />
        <div className="absolute -right-36 top-28 -z-10 h-72 w-72 rounded-full bg-[#e7efff] blur-3xl" />
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce6ff] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#2858ca] shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1e5eff]" /> Built for the people behind great shows
            </div>
            <h1 className="font-display text-balance text-[43px] font-bold leading-[1.05] tracking-[-0.052em] text-[#101828] sm:text-[60px] lg:text-[74px]">Great talent.<br /><span className="text-[#1e5eff]">Seamless shows.</span></h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">One place to organise artists, groups, venues, and every moving part of your live programme.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/sign-up" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e5eff] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(30,94,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#164bd7] sm:w-auto">Start organising <ArrowRight size={17} /></a>
              <a href="#features" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto">Explore the platform <ChevronDown size={17} /></a>
            </div>
            <p className="mt-4 text-xs text-slate-500">Bring clarity to every performance, from the first booking to the final bow.</p>
          </div>
          <div className="mt-14 sm:mt-16"><ProductPreview /></div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-10 gap-y-5 text-center sm:justify-between">
          {[
            [CalendarDays, 'Every show, in one view'],
            [UsersRound, 'Your roster, always ready'],
            [ShieldCheck, 'Details your team can trust'],
            [Clock3, 'Less coordination overhead'],
          ].map(([Icon, label]) => {
            const FeatureIcon = Icon as typeof CalendarDays;
            return <div key={label as string} className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 sm:text-sm"><FeatureIcon size={17} className="text-[#4c75e5]" />{label as string}</div>;
          })}
        </div>
      </section>

      <section id="teams" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3667db]">Made for your whole world</p>
            <h2 className="font-display mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-5xl">The work around a performance should feel effortless.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">ArtistePulse gives every person in the process a clearer view of what&apos;s ahead and what needs attention.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 sm:mt-12">
            {audienceCards.map(({ icon: Icon, title, description, accent }) => (
              <a key={title} href="#features" className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#cbd9ff] hover:shadow-[0_18px_40px_rgba(29,61,126,0.1)] sm:p-7">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}><Icon size={21} /></span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.035em] text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2860e4]">See what&apos;s possible <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#f5f8ff] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3667db]">The platform</p><h2 className="font-display mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-5xl">All the details, moving in the same direction.</h2></div>
            <a href="/sign-up" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#275bd7] transition hover:text-[#123fba]">Create your workspace <ArrowRight size={16} /></a>
          </div>
          <div className="mt-12 space-y-4 sm:mt-14">
            {features.map((feature, index) => (
              <article key={feature.number} className={`grid overflow-hidden rounded-[22px] border border-[#e0e8f7] bg-white lg:grid-cols-2 ${index === 1 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
                <div className="p-7 sm:p-10 lg:p-12">
                  <p className="text-xs font-bold tracking-[0.16em] text-[#4271df]">{feature.number} · {feature.eyebrow}</p>
                  <h3 className="mt-4 max-w-md text-2xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-3xl">{feature.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{feature.description}</p>
                  <ul className="mt-7 space-y-3">
                    {feature.items.map((item) => <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf0ff] text-[#255ddd]"><Check size={12} strokeWidth={3} /></span>{item}</li>)}
                  </ul>
                </div>
                <div className={`relative min-h-[270px] overflow-hidden ${index === 0 ? 'bg-[#e7eeff]' : index === 1 ? 'bg-[#e8f7f1]' : 'bg-[#fff2e8]'}`}>
                  {index === 0 && <div className="absolute bottom-0 left-[12%] right-[8%] top-10 rounded-t-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(44,74,134,0.14)]"><div className="flex items-center justify-between"><div className="h-3 w-24 rounded-full bg-slate-200" /><div className="h-6 w-16 rounded-md bg-[#edf2ff]" /></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-[#f8faff] p-3"><div className="h-8 w-8 rounded-full bg-[#c9d9ff]" /><div className="mt-3 h-2 w-16 rounded-full bg-slate-300" /><div className="mt-2 h-2 w-11 rounded-full bg-slate-200" /></div><div className="rounded-lg bg-[#f8faff] p-3"><div className="h-8 w-8 rounded-full bg-[#caeddf]" /><div className="mt-3 h-2 w-16 rounded-full bg-slate-300" /><div className="mt-2 h-2 w-11 rounded-full bg-slate-200" /></div></div></div>}
                  {index === 1 && <div className="absolute bottom-0 left-[10%] right-[10%] top-11 rounded-t-2xl border border-[#d5e9e1] bg-white p-5 shadow-[0_18px_40px_rgba(35,111,87,0.12)]"><div className="flex items-center justify-between"><div><div className="h-3 w-24 rounded-full bg-slate-700" /><div className="mt-2 h-2 w-16 rounded-full bg-slate-200" /></div><CalendarDays size={21} className="text-[#159273]" /></div><div className="mt-6 space-y-2.5">{[70, 90, 55, 78].map((width, row) => <div key={width} className="flex items-center gap-2"><span className="w-8 text-[9px] font-semibold text-slate-400">{18 + row}:00</span><span style={{ width: `${width}%` }} className={`h-7 rounded-md ${row % 2 ? 'bg-[#cdeee1]' : 'bg-[#dce8ff]'}`} /></div>)}</div></div>}
                  {index === 2 && <div className="absolute bottom-0 left-[14%] right-[7%] top-10 rounded-t-2xl border border-[#f0dfd1] bg-white p-5 shadow-[0_18px_40px_rgba(128,73,28,0.12)]"><div className="flex items-center justify-between"><div className="h-3 w-28 rounded-full bg-slate-700" /><span className="rounded-full bg-[#fff2e8] px-2 py-1 text-[9px] font-bold text-[#bd5b26]">3 to review</span></div><div className="mt-5 grid grid-cols-7 gap-1.5">{Array.from({ length: 21 }, (_, cell) => <span key={cell} className={`h-7 rounded-md ${[2, 8, 15].includes(cell) ? 'bg-[#ffbd87]' : cell % 4 === 0 ? 'bg-[#d9e4ff]' : 'bg-[#eef2f7]'}`} />)}</div><div className="mt-5 flex gap-3 text-[9px] font-medium text-slate-500"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#d9e4ff]" />Confirmed</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#ffbd87]" />Review</span></div></div>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3667db]">Start simply</p><h2 className="font-display mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-5xl">From first detail to showtime.</h2></div>
          <div className="relative mt-12 grid gap-7 md:grid-cols-3 sm:mt-16">
            <div className="absolute left-[17%] right-[17%] top-8 hidden border-t border-dashed border-[#bdcef7] md:block" />
            {[
              ['01', 'Add your talent', 'Create a clear roster with the people and information your team needs.'],
              ['02', 'Organise your world', 'Connect groups, venues, duties, and the details around every show.'],
              ['03', 'Move with confidence', 'See your programme in context and keep the next performance on track.'],
            ].map(([number, title, description]) => <div key={number} className="relative text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d7e2ff] bg-[#edf3ff] text-sm font-bold text-[#285dd9] shadow-sm">{number}</span><h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-slate-900">{title}</h3><p className="mx-auto mt-3 max-w-[270px] text-sm leading-6 text-slate-600">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#f8faff] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1040px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3667db]">Questions, answered</p><h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">Everything you need to get started.</h2><p className="mt-5 text-sm leading-6 text-slate-600 sm:text-base">Can&apos;t find what you&apos;re looking for? Create an account and start exploring your workspace.</p><a href="/sign-up" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#275bd7] hover:text-[#123fba]">Get started <ArrowRight size={16} /></a></div>
          <div>{faqs.map((faq) => <FaqItem key={faq.question} {...faq} />)}</div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#101a34] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-[#245de8]/30 blur-3xl" /><div className="absolute -bottom-40 left-[20%] -z-10 h-64 w-64 rounded-full bg-[#5f7ee5]/20 blur-3xl" />
        <div className="mx-auto max-w-2xl text-center"><BrandMark inverted /><h2 className="font-display mt-8 text-balance text-3xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Make room for the work that matters: the show.</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#c6d2f0]">Bring your people, places, and plans together with ArtistePulse.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href="/sign-up" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#153b9e] transition hover:-translate-y-0.5 hover:bg-[#edf2ff]">Create your account <ArrowRight size={17} /></a><a href="/sign-in" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Sign in</a></div></div>
      </section>

      <footer className="bg-[#0b1328] px-5 py-10 text-[#b8c5e5] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark inverted />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"><a href="#features" className="hover:text-white">Features</a><a href="#teams" className="hover:text-white">For teams</a><a href="#faq" className="hover:text-white">FAQ</a><a href="/sign-in" className="hover:text-white">Sign in</a><a href="/sign-up" className="hover:text-white">Create account</a></div>
        </div>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 pt-7 text-xs text-[#8493b5] sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} ArtistePulse. Built for better live work.</p><p>Talent and show organisation, brought together.</p></div>
      </footer>
    </main>
  );
}
