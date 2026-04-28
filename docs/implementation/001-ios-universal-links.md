# Iteration 001 — iOS Universal Links

**Date**: 2026-04-28
**Status**: In Progress

## Goal

Replace the broken TinyURL+custom-scheme deep link in shared session messages
with iOS Universal Links served from the existing Amplify Hosting domain
(`main.d2m423juctwnaf.amplifyapp.com`), so iOS Messages renders shared session
links as a single tappable link that opens the app directly.

## Background

The `Share Group Status` flow used to put a `bellewoodgolf://session/<id>`
custom-scheme deep link in the message. That worked, but the URL was long
and ugly. We added a TinyURL wrapper (see `URL_SHORTENING_FEATURE.md`) which
hid the long URL behind `tinyurl.com/<slug>` that 302-redirected to the
custom scheme.

Recent iOS releases tightened anti-phishing on Messages. Shortened URLs whose
final destination is a non-`https` custom scheme:

1. No longer auto-link inline (the URL appears as plain text, not tappable).
2. Trigger a detached link-preview bubble — the user sees a second, useless
   "tinyurl.com/..." preview message tacked on after the share message.

The proper iOS-native fix is **Universal Links** — real `https://...` URLs
associated with the app via an Apple App Site Association (AASA) file hosted
on a domain we own. iOS treats them as both a real link (so Messages auto-
links them and renders a single inline preview) and as a deep link into the
app when installed (with a graceful Safari fallback when not).

## What We Set Out to Build

- **Web (`golf-scheduler` repo)**: serve an AASA file at
  `https://main.d2m423juctwnaf.amplifyapp.com/.well-known/apple-app-site-association`
  granting Universal Link rights to the iOS app for the path `/session/*`.
  Force `Content-Type: application/json` via `next.config.ts`. Add a minimal
  Next.js page at `/session/[id]` as a non-iOS / no-app-installed fallback.
- **Mobile (`golf-scheduler-mobile` repo)**: add the `associatedDomains`
  entitlement in `app.json`, extend the deep-link parser in `App.tsx` to
  match the `https://main.d2m423juctwnaf.amplifyapp.com/session/<id>` form
  in addition to the existing `bellewoodgolf://session/<id>` scheme, and
  remove the TinyURL wrapper from `SessionCard.tsx`.

## Architecture Notes

- **Apple Team ID**: `427V8P4F24`
- **Bundle identifier**: `com.mhornak.bellewood-golf-crew`
- **AASA `appID`**: `427V8P4F24.com.mhornak.bellewood-golf-crew`
- **Universal Link path**: `/session/*`
- **AASA hosting**: served via a Next.js Route Handler at
  `src/app/.well-known/apple-app-site-association/route.ts`, _not_ as a
  static file in `public/`. Discovered during the first deploy that AWS
  Amplify Hosting serves `public/` files directly through CloudFront from
  S3, which sets `Content-Type: application/octet-stream` for extension-less
  files and ignores `next.config.ts` `headers()` config. A Route Handler
  runs in Next.js compute so the response Content-Type is set explicitly to
  `application/json`.
- The custom-scheme `bellewoodgolf://session/<id>` handler stays in place —
  it still works for in-app navigation and is harmless to keep.
- This iteration spans two repos. The iteration record lives here (in
  `golf-scheduler-mobile`) because that's where the compound engineering
  setup is. The web repo will get its own commit referencing this iteration
  number in the message.
- Native iOS rebuild required because `associatedDomains` is a native
  entitlement — Expo Go won't pick it up. Verification path is a fresh
  EAS build → TestFlight → real-device test.
