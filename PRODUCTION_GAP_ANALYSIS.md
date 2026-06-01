# Production Gap Analysis

A granular audit classifying everything preventing Sonara from becoming a real Google Play Store deployable application.

---

## 1. Critical Gaps

### Issue: Missing Google Services Configuration (`google-services.json`)
* **Classification**: Critical
* **Impact**: The app crashes immediately upon startup because the Firebase SDK attempts to read required configuration strings (Project ID, API Key, etc.) from resources populated by the `google-services` plugin.
* **Fix**: Generate and download `google-services.json` from the Firebase Console and save it into the `android/app/` directory.
* **Estimated Implementation Effort**: 10 minutes (Configuration extraction)

### Issue: Non-production Key and Signing Configuration
* **Classification**: Critical
* **Impact**: Utilizing debug signatures in release mode prevents Google Play Store ingestion. Release bundles must have aligned signatures.
* **Fix**: Update the `app/build.gradle.kts` configuration to include a production release signing block referencing variables or environment variables:
  ```kotlin
  signingConfigs {
      create("release") {
          storeFile = file(System.getenv("RELEASE_KEYSTORE_PATH") ?: "keystore.jks")
          storePassword = System.getenv("RELEASE_KEYSTORE_PASSWORD")
          keyAlias = System.getenv("RELEASE_KEY_ALIAS")
          keyPassword = System.getenv("RELEASE_KEY_PASSWORD")
      }
  }
  ```
* **Estimated Implementation Effort**: 30 minutes (Keystore generation and environment sync)

---

## 2. High Gaps

### Issue: Lacking Play Integrity API Nonce & Backend Verification
* **Classification**: High
* **Impact**: Malicious actors could sideload cracked versions of the app, bypass premium restrictions, or abuse the music streaming streaming backend APIs by making requests outside of the official client.
* **Fix**: Implement the Play Integrity manager to request attestation tokens, and establish a backend endpoint to decrypt and verify the integrity verdict.
* **Estimated Implementation Effort**: 3 days (Requires server integration)

### Issue: Incomplete Jetpack Security Storage Implementation
* **Classification**: High
* **Impact**: Secure login credentials and auth tokens are exposed on rooted devices since the Keystore `Cipher` is created but not wired into an active storage facade like `EncryptedSharedPreferences`.
* **Fix**: Instantiate EncryptedSharedPreferences on first-run with MasterKeys:
  ```kotlin
  val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
  val sharedPreferences = EncryptedSharedPreferences.create(
      "secure_prefs",
      masterKeyAlias,
      context,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )
  ```
* **Estimated Implementation Effort**: 2 hours

---

## 3. Medium Gaps

### Issue: Missing Network Security Config & SSL Pinning
* **Classification**: Medium
* **Impact**: Susceptible to Man-In-The-Middle (MITM) attacks if user certificates are loaded onto the operating system.
* **Fix**: Create `res/xml/network_security_config.xml` declaring pinning hashes:
  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <network-security-config>
      <domain-config cleartextTrafficPermitted="false">
          <domain includeSubdomains="true">api.sonara.music</domain>
          <pin-set>
              <pin digest="SHA-256">7HI7y9HJNIPb63W9v63T9F3G3Y4W=</pin>
          </pin-set>
      </domain-config>
  </network-security-config>
  ```
* **Estimated Implementation Effort**: 1 hour

### Issue: Missing WorkManager Sync Worker Classes
* **Classification**: Medium
* **Impact**: Offline tracks cached on disk might become desynced over time from the remote server when user playlists are modified from the web portal.
* **Fix**: Create a `PlaylistSyncWorker` class extending `CoroutineWorker` that leverages the local Repo layer to fetch latest playlists, downloading and deleting cached `.mp3` assets in the background.
* **Estimated Implementation Effort**: 1.5 days

---

## 4. Low Gaps

### Issue: Lack of Missing Drawable Placeholder Assets
* **Classification**: Low
* **Impact**: Small compile-time warnings during layout generation in XML layout folders. Specifically `@drawable/widget_preview` and companion icon XML wrappers.
* **Fix**: Supply vector XML files into the `res/drawable` folder for icons and layout previews.
* **Estimated Implementation Effort**: 1.5 hours (Asset production)
