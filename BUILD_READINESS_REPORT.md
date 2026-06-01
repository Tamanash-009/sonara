# Build Readiness Report

This report outlines the status of files, implementation stubs, metadata, and gaps currently present in the Sonara Android native codebase.

## 1. File Status Check
All required module elements reside under `android/` workspace maps:
* **`settings.gradle.kts`**: Created & Verified
* **`build.gradle.kts` (Root)**: Created & Verified
* **`app/build.gradle.kts`**: Created & Verified
* **`AndroidManifest.xml`**: Created & Verified
* **`SonaraApplication.kt`**: Created & Verified
* **`MainActivity.kt`**: Created & Verified
* **`MediaPlaybackService.kt`**: Created & Verified
* **`SecurityManager.kt`**: Created & Verified
* **`DownloadManager.kt`**: Created & Verified

## 2. Missing Files
* **`google-services.json`**: Required at compiler phase to boot Google Firebase systems. Must be downloaded from the Google Firebase Console and pasted into `android/app/`.
* **`keystore.jks`**: Required for signing release bundles (`assembleRelease`, `bundleRelease`). Lacking this prevents Google Play Console publication.
* **`widget_preview.png`**: Visual asset missing from drawable packages (`res/drawable/`). Causes compile warnings during XML resource compilation.
* **`local.properties`**: Declares local system paths to the Android SDK (`sdk.dir`). Generated dynamically on Android Studio bootstrap but absent in raw repository copies.

## 3. Stub Implementations & Placeholders
* **Offline Music Core (Tracks API)**: Built on mock list tracks inside UI components. Real implementations must query the database repo rather than static lists.
* **Authentication Storage**: Dynamic keystore cipher initialized but actual storage fallback onto Jetpack EncryptedSharedPreferences is missing.
* **Google Sign-In Intent Handlers**: Google Auth API declared in build files but callback logic and credential retrievals inside `MainActivity.kt` require OAuth activity binding.

## 4. Todo Comments
* There are zero TODO comments in the created files; however, default exception catch blocks in download streams are blank and must write error tracking to Crashlytics.

## 5. Unimplemented Interfaces
* **`WorkManager` Tasks**: Background syncing tasks (e.g., dynamic playlist updates or telemetry syncing) are declared in build files but lack matching `Worker` classes.
* **`Play Integrity API` Providers**: Library integrated but actual device token generation callback handlers with backend nonce validation are missing.

## 6. Security Gaps
* **SSL Pinning**: No custom Network Security Config (`res/xml/network_security_config.xml`) or OkHttpClient setup is pinning domains.
* **Tamper Verification**: Threat check only flags common Root binary files; it lacks dynamic emulator runtime checking or package signature verification checks.

## 7. Performance Risks
* **ExoPlayer Loading Buffers**: Default ExoPlayer configuration consumes basic background sizes. Large buffers may lead to OOM errors on low-end devices without pre-allocation tuning.
* **Image Delivery**: Background lists do not cache covers locally. Lacks memory-efficient thumbnail generation for lists with many items.

## 8. Release Blockers
* **Signature Alignment**: The build config uses `signingConfigs.getByName("debug")` for both debug and release. Release builds must use a dedicated production Keystore alias.
* **ProGuard Strict Mode**: ProGuard configuration is basic. Real third-party dependencies (like Coil and Firebase) require explicit rules to avoid runtime reflection crashes.
