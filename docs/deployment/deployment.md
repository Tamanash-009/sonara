# Deployment Guide

## Mobile Application Deployment

### Google Play Store Release
1. Build the production App Bundle:
   ```bash
   export KEYSTORE_PASSWORD="your-production-password"
   export KEY_PASSWORD="your-production-password"
   ./gradlew bundleRelease
   ```
2. Locate the `.aab` file in `app/build/outputs/bundle/release/app-release.aab`.
3. Open the [Google Play Console](https://play.google.com/console).
4. Create a new Release under the Production track.
5. Upload the `.aab` file and complete the release notes.

## Web Landing Page Deployment

The landing page (located in the root directory) is a static site optimized for Vercel.

1. Ensure the Vercel CLI is installed: `npm i -g vercel`
2. Run the deployment command from the project root:
   ```bash
   vercel --prod
   ```
3. The CLI will output the production URL of the landing page.
