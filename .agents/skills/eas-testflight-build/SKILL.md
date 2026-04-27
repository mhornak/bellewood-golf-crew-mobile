---
name: eas-testflight-build
description: Build and deploy the iOS app to TestFlight using EAS Build. Use when the user mentions TestFlight, expired build, pushing a build, deploying to TestFlight, submitting to App Store Connect, or running an iOS production build.
---

# EAS TestFlight Build & Deploy

## Prerequisites

- Logged in to EAS CLI (`eas whoami`)
- Apple Developer account credentials configured
- EAS project linked (project ID in `app.json`)

## Build & Submit to TestFlight

### One-step (recommended)

```bash
eas build --platform ios --profile production --auto-submit
```

This builds the app in the cloud and automatically submits to App Store Connect / TestFlight when complete. The `production` profile auto-increments the build number via `eas.json`.

### Two-step (if you need to inspect the build first)

```bash
# Step 1: Build
eas build --platform ios --profile production

# Step 2: Submit the latest build
eas submit --platform ios --profile production --latest
```

## After Submission

1. Apple processes the build (typically 5-15 minutes)
2. An email arrives from Apple when processing completes
3. The build appears in TestFlight for all testers in the group

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Not logged in | Run `eas login` |
| Expired signing credentials | EAS prompts to regenerate during build; follow the prompts |
| Build fails | Check build logs at the URL EAS prints, or run `eas build:list` to find recent builds |
| TestFlight build expired | Normal after 90 days — just push a new build using the steps above |

## EAS Build Profiles

This project's `eas.json` defines three profiles:

| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev client builds | Internal |
| `preview` | Internal testing builds | Internal |
| `production` | App Store / TestFlight | Store (auto-increment) |
