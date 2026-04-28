# Iteration 001 — iOS Universal Links — Learnings

## What Worked

1. **Reusing the existing Amplify Hosting domain.** No new infrastructure,
   no new DNS, no new TLS cert — the AASA file just needed to be served
   from a domain we already owned and Apple was happy. The "domain thing"
   recollection was the right instinct.

2. **The `start-iteration` → execute → `complete-iteration` loop.** This
   was the inaugural use of the compound engineering layer and it earned
   its keep immediately: the iteration record forced clarity on goal and
   scope before code touched, and the discovery of Amplify's CloudFront
   bypass got captured in `What Changed From Plan` rather than evaporating.

3. **Cross-repo iteration with the record on the mobile side.** The fix
   spanned `golf-scheduler-mobile` and `golf-scheduler` (web), but the
   iteration record only lives in the mobile repo (where compound
   engineering is set up). Adding a one-line note to commit messages on
   the web side referencing iteration 001 was enough — no need to set up
   compound engineering in the web repo just to host one record.

## What Didn't Work

1. **Static `public/` AASA file with `headers()` config in `next.config.ts`.**
   Looked obvious and conventional. Failed silently — the response had the
   right body but `Content-Type: application/octet-stream`. Amplify
   Hosting's CloudFront layer serves `public/` files directly from S3 and
   never invokes Next.js compute, so any header rules in `next.config.ts`
   are bypassed. Lost ~10 minutes to this. Route Handler approach was the
   fix.

2. **Initial assumption that the iOS Messages "second bubble" was a bug.**
   It's not — once the URL is a real https Universal Link, iOS auto-
   generates a rich link preview tile, which visually shows up as a
   separate bubble. The OLD inline-link UX is impossible because iOS
   strips the inline URL when it attaches a rich preview. Functionally
   the preview bubble is the tappable target and the user experience is
   actually better — just visually different.

## Patterns That Emerged

1. **Amplify Hosting deployment quirks belong in architecture notes,
   not implementation details.** Future iterations that touch web
   hosting will need to know:
   - `public/` files bypass Next.js
   - `next.config.ts` `headers()` only applies to compute-served routes
   - Route Handlers (`route.ts`) are the reliable lever for response
     headers
   This is captured in `docs/architecture/overview.md` so we don't
   re-discover it.

2. **For Apple AASA / Universal Links specifically:**
   - Always serve via Route Handler, never as a static `public/` file
     on Amplify (or any CloudFront-fronted CDN).
   - Validate via Apple's CDN URL, not just direct curl — Apple's CDN
     is what the device actually fetches.
   - Use the modern AASA format (`appIDs` plural, `components` array)
     rather than legacy (`appID`, `paths`).

3. **Native entitlement changes require a profile regen.** When EAS
   prompts "provisioning profile is no longer valid — reuse?", the
   answer is yes. EAS will add the new capability (in our case
   Associated Domains) to the App ID and regenerate the profile in
   place.

## What We'd Do Differently

1. **Run `npx tsc --noEmit` _before_ touching anything.** The
   `start-iteration` skill says to verify the starting state is green.
   We didn't — and the run after our changes turned up three pre-
   existing errors (`SessionCarousel.tsx:252`, `useSessionResponse.ts:42`
   and `:138`) that aren't ours but are now ambient noise on every
   future typecheck. Should have either fixed them upfront or at least
   recorded "baseline is red" before changing files.

2. **Lock-file housekeeping.** The bash sandbox kept leaving stale
   `.git/index.lock` files because it can't unlink them through the
   FUSE mount. Going forward, all git commands should be run in the
   user's terminal, not via the sandbox bash tool. (Documented in
   compound engineering loop convention going forward.)

3. **Predict the rich-link-preview UX up front.** Should have called
   it explicitly in the iteration plan that the new behavior would
   look different (rich preview bubble vs. inline link), so it
   wouldn't surface as "did this not work?" during real-device test.
