# ArtistePulse landing page and authentication plan

Date: 2026-09-26  
Status: Planning only; no application changes implemented.

## 1. Objective and scope

Create a Backstage-inspired public landing page for ArtistePulse, plus dedicated sign-in and sign-up pages that lead into the existing talent and show organiser.

Use Backstage's audience-focused storytelling and conversion structure with ArtistePulse branding, original copy, and imagery we own or have permission to use. The working assumption is that the product remains a management tool for organisers, agencies, and production teams. A public casting marketplace, job applications, subscriptions, and performer self-service accounts would be separate features.

This document is the first deliverable. Implementation follows in the phases below.

## 2. Backstage research

### Evidence and limitations

The direct homepage returned almost no extractable content. Search-indexed content for the homepage and official Backstage product/help pages provided the findings below. The browser connection reported no available browsers, so desktop/mobile screenshots, exact styling, interactive navigation, and the live sign-in screen were not verified. Search indexes can lag the live site; these findings are a content reference, not a pixel-accurate audit.

| Verified content pattern | Application to ArtistePulse |
| --- | --- |
| The indexed homepage leads with a career outcome and a join action. | Lead with the outcome of organising artists and shows, followed by account creation. |
| Audience sections distinguish performers from people hiring talent. | Explain use cases for agencies, show organisers, and venue teams. |
| Testimonials, brand references, and aggregate platform statistics establish credibility. | Use an actual product preview initially; add testimonials or customer logos only when supplied and verified. |
| Job previews and editorial content give visitors more ways to explore. | Show illustrative roster, venue, and schedule previews tied to existing features. |
| Join actions recur through the page. | Repeat a consistent create-account action after feature sections and near the footer. |

Source: [Backstage indexed homepage](https://www.backstage.com/?gad=1), researched on 2026-09-26. The primary reference is [backstage.com](https://www.backstage.com/).

The [actors and performers page](https://www.backstage.com/actors-and-performers/) combines audience categories, opportunity previews, product benefits, supporting guides, FAQs, and account-creation prompts. This supports explaining the product through progressively more detailed sections.

The official [crew profile guide](https://help.backstage.com/en/articles/12633173-crew-profiles-applying-to-opportunities) documents email or SSO entry, followed by account details and then profile setup. Adopt the principle of separating account creation from detailed onboarding. This does not establish that every Backstage signup path is identical.

### Design interpretation

The visual choices in this plan are proposals for ArtistePulse, not verified Backstage specifications. Use prominent typography, performance photography, clear section hierarchy, category cards, and repeated primary actions. Before implementing any closer visual reproduction, inspect the live reference at desktop and mobile widths when browser access is available.

## 3. Current project findings

| Area | Current implementation | Required adjustment |
| --- | --- | --- |
| Framework | Next.js 15, React 19, TypeScript, Tailwind 3, Lucide icons | Stay within the existing stack. |
| Root page | `app/page.tsx` renders `DashboardView` | Replace with the public landing page. |
| Dashboard alias | `app/dashboard/page.tsx` imports the root page | Make it render the dashboard independently before replacing `/`. |
| Root layout | `app/layout.tsx` wraps every page in `Providers` and `AppShell` | Move workspace providers and shell into a workspace route-group layout. |
| Navigation | Dashboard mappings in the root page and `Sidebar.tsx` use `/` | Point all dashboard navigation to `/dashboard`. |
| Data | `AppContext` and `storage.ts` use browser localStorage and seeded demo data | Keep public pages independent of workspace initialization; plan real identity separately. |
| User model | `UserProfile` and `SystemUser` describe profiles and roles | These are not authenticated identities or permission enforcement. |
| Authentication | No auth SDK in dependencies or auth routes in the inspected tree | Add a provider integration before claiming production sign-in works. |
| Localisation | English, Georgian, and Turkish dictionaries; root HTML currently says `ka` | Extend translations and align document language with the selected locale. |
| Styling | Shared CSS variables, dark mode, global heading/button styles, mobile `header` override | Scope public styling and avoid leaking workspace layout rules. |
| Assets | Favicon and local FiraGO Latin fonts | Obtain hero/card imagery and verify Georgian font coverage. |
| Tooling | Build and lint scripts exist; README still describes Vite | Validate actual tool commands and update setup documentation during implementation. |

The existing untracked `pnpm-lock.yaml` is unrelated to this planning work and must be preserved.

## 4. Proposed landing page

### Content order and interactions

1. **Header:** ArtistePulse wordmark; Features, How it works, and FAQ anchor links; language selector; Sign in; primary Create account button. Mobile navigation uses an accessible toggle with Escape-to-close and predictable focus handling.
2. **Hero:** Proposed headline: “Great talent. Seamless shows.” Supporting text: “Manage artists, groups, venues, and every show on your calendar in one place.” Primary action links to `/sign-up`; secondary “Explore the platform” scrolls to `#features`. Pair the copy with licensed performance imagery and a small illustrative schedule preview.
3. **Product proof:** A curated dashboard preview showing roster and scheduling capabilities. Use fictional, explicitly illustrative records; do not expose real names, contacts, contracts, or documents. Avoid invented customer counts or endorsements.
4. **Audience cards:** Talent agencies, show organisers, and venue teams. Each card links to a relevant feature anchor rather than implying separate portals already exist.
5. **Feature stories:** Artist profiles and contracts; groups and responsibilities; venues and show scheduling; conflict detection and duty rotation. Connect each benefit to an existing feature with a screenshot or small static preview.
6. **How it works:** Add your talent → organise groups and venues → schedule and coordinate shows. Do not imply this is an enforced onboarding flow yet.
7. **FAQ:** Explain intended users, supported languages, and core workflows. Describe collaboration, cloud sync, or account availability only to the extent implemented. Do not advertise pricing or a free trial without a defined offer.
8. **Closing call to action:** Repeat the account-creation action and provide a sign-in link for existing users.
9. **Footer:** Brand, product anchors, sign-in/sign-up links, and approved privacy/terms links when available. All visible links must resolve; no placeholder `#` destinations.

### Proposed visual system

- Preserve the ArtistePulse name and existing primary blue; combine warm white sections, charcoal text, restrained blue accents, and one dark closing section.
- Use a split hero on desktop and stacked content on mobile. Target a 1200–1280px content width, generous section spacing, and fluid headline sizing around 40–72px.
- Use the existing font system where language coverage is adequate. Add an appropriate local Georgian font if needed.
- Prefer broad photography crops and simple feature cards with subtle borders. Avoid making every section look like a dashboard widget.
- Use optimised local images with fixed dimensions, responsive sizes, useful alt text, and lazy loading below the hero. Preserve image attribution/license records.
- Keep motion subtle and respect reduced-motion preferences. No autoplay carousel is needed for the initial version.
- Public and auth pages use consistent light styling; scope their tokens so stored workspace dark mode cannot make them unreadable.

## 5. Sign-in and sign-up pages

Both pages share an `AuthLayout`: brand/home link, a focused form panel, and an optional performance image with short product copy. Collapse to a single form column on smaller screens. Forms have persistent labels, keyboard focus, password visibility controls, autocomplete attributes, and errors associated with fields.

### `/sign-in`

- Fields: email and password.
- Actions: Sign in, Create account, and Forgot password when the recovery flow is implemented.
- States: initial, invalid input, submitting, invalid credentials, unverified email, network/provider failure, and success.
- Prevent duplicate submissions; preserve email on failure. Never log or persist passwords in browser storage.
- On success, navigate to a validated internal `next` destination or `/dashboard`. Reject external URLs and authentication-loop destinations.
- For an existing valid session, redirect to the dashboard or validated destination.

### `/sign-up`

- Initial fields: full name, email, password, and confirm password. Keep company information and profile details for later onboarding.
- Show password requirements that match the chosen provider and validate on both client and server/provider boundaries.
- Include consent and policy links once the actual terms/privacy destinations are available. Keep optional marketing consent separate and unchecked.
- States: initial, field errors, submitting, provider rejection, verification email sent, resend cooldown, and completion.
- When verification is required, show a check-email page/state rather than immediately granting workspace access. Support expired verification links and retry.
- Do not offer privileged role selection. Any workspace ownership must be scoped to a newly created workspace; joining an existing organisation requires an authorised invitation.
- Existing-account and invalid-credential messaging should follow the provider's account-enumeration protections.

### Supporting authentication behaviour

- Plan `/forgot-password`, `/reset-password`, `/verify-email`, and a provider callback endpoint if required by the integration. They are supporting scope for functioning email/password authentication.
- Add a real sign-out action to the workspace menu; invalidate the session and clear in-memory user/workspace state.
- Implement server-verified workspace access. A browser flag or client redirect is insufficient.
- Keep demo data isolated from real accounts. Global localStorage keys currently make browser data shared across identities, so do not load that data into authenticated accounts automatically.
- Hide social sign-in until a provider is configured. SSO is optional scope, not required to match Backstage's documented flow.

## 6. Routing and component architecture

Proposed file structure; route-group names do not change public URLs:

```text
app/
  layout.tsx                    # document, fonts, metadata; minimal shared providers
  (marketing)/
    layout.tsx                  # public header/footer
    page.tsx                    # /
  (auth)/
    layout.tsx                  # shared auth presentation
    sign-in/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    verify-email/page.tsx
  (workspace)/
    layout.tsx                  # server session check + workspace providers + AppShell
    dashboard/page.tsx
    talents/page.tsx
    groups/page.tsx
    groups/[id]/page.tsx
    venues/page.tsx
    calendar/page.tsx
    archive/page.tsx
    settings/...                # preserve settings, profile, and roles URLs
src/components/
  marketing/                    # header, hero, features, workflow, FAQ, footer
  auth/                         # auth panel, fields, sign-in/sign-up forms
src/lib/auth/                   # server/client provider adapters and session helpers
public/images/marketing/       # approved, optimised imagery
```

- Move routes rather than leaving duplicate files that resolve to the same URL. Update relative imports after moves.
- Extract the dashboard page's navigation callback and modal bindings into the workspace implementation; remove its dependency on the public homepage.
- Keep static marketing sections server-rendered where practical. Limit client components to language controls, mobile navigation, FAQ interaction, and forms.
- Split current `Providers`: language support may be shared, but `AppProvider`, workspace modals, and the workspace shell belong only to workspace routes.
- Metadata should identify each public/auth page. Exclude authentication pages from indexing; use the public homepage as the marketing canonical URL once the domain is known.

## 7. Authentication implementation boundary

The repository has no real identity backend. A polished form alone cannot create secure accounts.

Default implementation sequence: build the public pages and auth form states first, then integrate a maintained authentication service behind a small adapter. Provider selection remains open until existing hosting, account infrastructure, email delivery, and deployment constraints are known; do not provision a paid service as part of the UI work.

Before production authentication is considered complete:

- Configure credentials and callback URLs through environment variables, with a documented `.env.example` containing no secrets.
- Verify identity server-side, use the provider's supported secure session mechanism, and enforce access in server data operations as well as page navigation.
- Implement verification, recovery, sign-out, session expiry, and rate-limit/abuse handling supported by the provider.
- Bind authenticated identities to profiles and workspace membership rather than trusting editable profile roles.
- Introduce user/workspace-scoped persistence for production data. Preserve existing local demo data separately and require an explicit import before migrating it.

If credentials/backend infrastructure are unavailable during the UI phase, represent the forms as an explicitly labelled preview with submission unavailable. Do not simulate successful authentication or describe protected access as complete.

## 8. Implementation phases

### Phase 1 — Foundation

- [ ] Record baseline build/type-check status and inspect desktop/mobile reference when available.
- [ ] Confirm imagery, draft copy, and the existing ArtistePulse brand direction.
- [ ] Separate marketing, auth, and workspace route layouts.
- [ ] Make `/dashboard` independent and update dashboard links.
- [ ] Scope public styles; retain workspace behaviour and URLs.

### Phase 2 — Landing page

- [ ] Build header, hero, product preview, audience cards, features, workflow, FAQ, and footer.
- [ ] Add responsive imagery, translated copy, metadata, and accessible interactions.
- [ ] Connect every CTA and navigation anchor to a real destination.

### Phase 3 — Authentication presentation

- [ ] Build shared auth layout and sign-in/sign-up forms.
- [ ] Implement field validation, password controls, and pending/error/verification views.
- [ ] Build the supporting recovery/verification presentation.
- [ ] Review desktop/mobile layouts and keyboard navigation.

### Phase 4 — Authentication integration

- [ ] Select/configure the provider based on deployment constraints.
- [ ] Connect account creation, verification, sign-in, recovery, and sign-out.
- [ ] Add server-side session enforcement and validated return destinations.
- [ ] Resolve identity-to-workspace mapping and persistence isolation before real account use.
- [ ] Document environment setup and the boundary between demo and production data.

### Phase 5 — Verification and delivery

- [ ] Run the available type check and production build. Check the existing lint setup; fix or document any baseline tooling failure rather than claiming a pass.
- [ ] Add focused integration tests for auth redirects, session enforcement, verification/recovery, and account data isolation once a provider is integrated.
- [ ] Review landing and auth screens at 375px, 768px, and 1440px, including long Georgian/Turkish labels.
- [ ] Verify visible focus, label/error announcements, colour contrast, reduced motion, and mobile menu behaviour.
- [ ] Smoke-test dashboard navigation, artist/group/venue views, scheduling, settings, and existing modals after moving routes.
- [ ] Check refresh/deep links, expired sessions, back navigation after sign-out, and malicious `next` parameters.
- [ ] Update the README with accurate Next.js setup and authentication configuration.

## 9. Acceptance criteria

1. `/` presents a responsive ArtistePulse marketing page without the workspace sidebar or modals.
2. `/sign-in` and `/sign-up` have coherent visual styling, accessible fields, meaningful validation, and working navigation between pages.
3. `/dashboard` and existing workspace URLs preserve their functionality; dashboard links no longer return users to the public homepage.
4. Public pages do not initialise or reveal private workspace data.
5. Production sign-in/sign-up work through a real provider, with verification and recovery where configured; unfinished preview forms are clearly identified.
6. Signed-out visitors cannot access protected server data or workspace pages; successful authentication respects only safe internal return paths.
7. Switching accounts never exposes the previous account's profile or workspace records.
8. All marketing claims reflect implemented features. No borrowed branding, unlicensed images, fabricated reviews, or unsupported marketplace promises are included.
9. English, Georgian, and Turkish text fit the layouts and document language is accurate.
10. Validation results and any remaining infrastructure dependency are reported explicitly.

## 10. Decisions to settle during implementation

- **Product direction:** This plan assumes organiser-focused ArtistePulse. A Backstage-style public casting marketplace would require a separate data model and feature plan.
- **Auth infrastructure:** Provider, deployment domain, email service, and workspace persistence are not yet specified.
- **Assets:** Performance photography, customer proof, and final policy content still need sourcing.
- **Visual fidelity:** Exact Backstage desktop/mobile styling remains unverified; the proposed design can proceed as an original adaptation.

These decisions do not block this planning deliverable. Infrastructure choices become dependencies before functional production authentication is delivered.
