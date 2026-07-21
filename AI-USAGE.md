# AI Usage

## Tools used

- **Claude Code** (Anthropic) — used as a pair-programming assistant in the terminal for
  scaffolding, writing boilerplate, and reviewing code.

## What AI assisted with

- Scaffolding the three apps (Laravel, Next.js, Node/TS) and wiring shared configuration.
- Drafting repetitive, well-understood code: Eloquent models/migrations, API Resources,
  Form Requests, React components, and the TanStack Query hooks.
- Writing the first drafts of tests (Pest + Vitest) and this documentation.
- Researching current framework versions from official documentation.

Architecture decisions (Sanctum vs JWT, the httpOnly-cookie proxy, RBAC via Policies, the
data model) were made deliberately and are explained in the README. The candidate reviewed and
is responsible for all submitted code.

## Example 1 — AI output was incorrect and needed correction (auth approach)

**What the AI first proposed:** an early plan suggested authenticating the API with **JWT** via a
third-party package (`tymon/jwt-auth` / a maintained fork), and it initially assumed a Laravel
version without checking.

**Why that was wrong / risky:**
1. The assessment brief never asks for JWT — it asks for "authorization awareness" and an
   "authorization test." JWT was an unnecessary, non-idiomatic choice.
2. Third-party JWT packages frequently lag behind new Laravel major releases, which is a real
   compatibility risk on **Laravel 13** (released March 2026).

**How it was corrected:** I re-read the brief (no JWT requirement) and checked the official
Laravel 13 documentation. The idiomatic, first-party approach is **Laravel Sanctum** (API token /
Bearer mode) for authentication plus **Policies + a `role` column** for RBAC. This is what the
project uses: zero third-party compatibility risk, revocable tokens, and a cleaner authorization
story (with the official `Sanctum::actingAs()` test helper).

## Example 2 — AI output needed improvement (caught by testing)

During end-to-end testing, login through the Next.js proxy returned **HTTP 500**. The AI-written
proxy used `http://localhost:8000` as the Laravel base URL. Node.js resolves `localhost` to IPv6
`::1`, but `php artisan serve` binds only to IPv4 `127.0.0.1`, producing `ECONNREFUSED ::1:8000`.
The fix was to use `127.0.0.1` explicitly (now documented in the README). This was only found
because I ran the full stack and traced the server logs rather than trusting that it "should work."

## Example 3 — two more AI mistakes that only surfaced under real testing

Both were written confidently by the AI and looked correct in review; only running the app on a
real device exposed them.

**(a) A copy button that lied.** The clipboard helper fell back to
`document.execCommand('copy')` when the async Clipboard API was unavailable, and trusted its
return value. On iOS Safari over plain HTTP (a non-secure context, e.g. reaching the dev server
via a LAN IP) that call returns `true` while writing nothing — so the UI showed "Copied" and the
clipboard stayed empty. Fixed by gating on `window.isSecureContext`, never claiming a copy that
cannot be verified, and falling back to selecting the text so the native iOS "Copy" bubble can be
used instead.

**(b) A dropdown that selected on open.** The Base UI `Select` defaults to
`alignItemWithTrigger` + `align="center"`, which stacks the currently selected option directly
over the trigger (native macOS style). The result was that the click which opened the dropdown
landed on an option and immediately committed a status change. Fixed by setting
`align="start"` and `alignItemWithTrigger={false}` so it behaves as a conventional dropdown.

The lesson in both cases: an API returning "success" is not evidence that the user-visible
outcome happened.

## How AI-generated code was reviewed and tested

- **Automated tests as the safety net.** Backend behavior is covered by 15 Pest tests (unit,
  API/integration, authorization) and the stats logic by Vitest — all green. Authorization was
  verified both in tests and by manual `curl` against the running stack (user → 403, admin → 200).
- **Type checking / builds.** `tsc --noEmit` and `next build` for the TypeScript apps;
  `php artisan test` + route inspection for the backend.
- **End-to-end manual verification.** I ran all three services together and exercised the real
  request path (login → list → filter → update status → respond) through the Next.js proxy,
  confirming HTTP status codes (200/201/204/401/403/404/422). This is how Example 2 was found.
- **Testing on a real device.** The UI was exercised on an actual iPhone over the LAN, not only in
  the browser's responsive emulator. Both problems in Example 3 were invisible on desktop and only
  reproduced there.
- **Reading every file.** Generated code was read and edited for correctness, naming, typing, and
  separation of concerns rather than accepted verbatim.
