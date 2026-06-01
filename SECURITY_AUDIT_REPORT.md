# Security Audit Report - Sonara Android Project

This audit outlines the cryptographic constraints, hardware-backed Keystore implementations, and active runtime protection schemes applied to secure Sonara's streaming data, user secrets, and server telemetry.

---

## 1. SSL Pinning Architecture

To defeat Man-In-The-Middle (MITM) attacks, Sonara implements strict SSL public-key pinning in OkHttp.

* **Target Endpoints**: `api.sonara.music` (JSON endpoint), `stream.sonara.music` (Audio source server).
* **Cryptographic Algorithms**: SHA-256 hash of the server's Subject Public Key Info (SPKI).
* **Backup Pin Sets**: Backup pins configured to prevent application lockouts during routine SSL certificate rotation cycles.
* **Declarative Safe Config (`NetworkModule.kt`)**:
  ```kotlin
  val certificatePinner = CertificatePinner.Builder()
      .add("api.sonara.music", "sha256/7HI7y9HJNIPb63W9v63T9F3G3Y4W=")
      .add("stream.sonara.music", "sha256/9HJNIPb63W97HI7yv63T9F3G3Y4W=")
      .build()
  ```

---

## 2. Android Keystore Hardware Isolation

Sonara uses the hardware-backed security container (TEE/StrongBox) to protect symmetric encryption keys.

* **Cryptographic Parameters**: AES-256 in GCM block mode with zero padding (`AES/GCM/NoPadding`).
* **Hardware Isolation Key Specs**:
  * Generated with `Purpose.ENCRYPT` | `Purpose.DECRYPT`.
  * Key generation parameters prevent hardware-backed parameters from being duplicated outside the secure execution context.
* **Key Rotation Strategy**: Automatically re-generates secret keys under the Secure Keystore alias block wrapper if system decryption verification triggers an standard format failure or if hardware configurations change.

---

## 3. Dynamic Runtime Protection & Anti-Tamper Routines

To guarantee safety in untrusted execution contexts, Sonara deploys multiple concurrent runtime checks:

1. **Root & Superuser Audits**:
   Ensures files like `/system/app/Superuser.apk`, `/sbin/su`, `/system/bin/su`, and custom Magisk binaries are unavailable on the device path.
2. **Hooking Framework Intercepts**:
   Scans resident native libraries via process map checks to detect interference from hooking frameworks such as Frida, Xposed, LSPosed, and Zygisk.
3. **Application Signature Validation**:
   Retrieves package signer fingerprints directly from the Gradle packaging manifest during runtime initialization and matches them against production-registered hashes.

---

## 4. Play Integrity API Integration

Provides structural attestation verification loops against Google Play Services:

* **Integrity Token Acquisition**:
  Requests are sent dynamically to the Play Store servers using a random, single-use, backend-generated cryptographic nonce payload.
* **Attestation Judgments Verified**:
  * **MEETS_DEVICE_INTEGRITY**: Device matches Android device specs.
  * **MEETS_BASIC_INTEGRITY**: Android system is structural but has bootloader profiles open.
  * **MEETS_STRONG_INTEGRITY**: Hardware-backed bootloader verification was successful.
* **Server Verification Strategy**:
  Decryption of integrity verdict payloads is securely offloaded to Sonara's central server to prevent decompilation bypasses inside the APK.
