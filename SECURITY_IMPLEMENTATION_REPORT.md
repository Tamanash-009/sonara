# Security Implementation Report - Sonara Android Project

Detailed specifications and implementation blueprints for the cryptographic isolation, anti-tampering, and memory hardening protections deployed across Sonara.

---

## 1. AES-GCM Implementation

To ensure data integrity, all storage operations (such as offline database caches or token storage) utilize authenticated encryption.

* **Mode**: AES-GCM-NoPadding (Galois/Counter Mode).
* **Key Generation**: 256-bit symmetric key saved in the `AndroidKeyStore`.
* **Initialization Vector (IV)**: Generated for every single write. Decryption blocks retrieve the IV parameters dynamically to avoid static key leaks.
* **Authentication Tag**: GCM inherently generates a 128-bit authentication tag. Any tampering of offline storage blocks instantly triggers a cryptographic verification failure and wipes cached states.

---

## 2. Layered Root & Tamper Detection Checkpoints

```
[ Application Boot ]
        │
        ├──> [ Signature Verification ] ──> Fail ──> [ Halt Boot ]
        │
        ├──> [ Root File Audits ] ────────> Fail ──> [ Exit App ]
        │
        └──> [ Hook Library Scan ] ───────> Fail ──> [ Clear State ]
```

### Path Audits
The system proactively looks for binary execution paths for common root systems:
* `/system/app/Superuser.apk`
* `/sbin/su`
* `/system/bin/su`
* `/system/xbin/su`
* `/data/local/xbin/su`
* `/data/local/bin/su`
* `/system/sd/xbin/su`

### Hook Framework Protection
The application opens and parses `/proc/self/maps` at startup to detect whether memory-resident libraries contains active references to:
* `frida` (Frida dynamic engine hook)
* `xposed` / `lsposed` (Xposed Framework integrations)

---

## 3. Play Integrity API Strategy

To prevent unauthorized API access, Sonara integrates the Play Integrity API with the backend server.

1. **Get Nonce**: The application fetches a random, cryptographic salt value (nonce) from Sonara's central security server.
2. **Request Attestation**: The client invokes the Google Play Services Integrity API, supplying the nonce payload.
3. **Server Verification**: The client forwards the resulting JWS token back to the server. The server decrypts it using Google API client libraries to verify that:
   * The app signature matches Sonara's production key.
   * The app package is `com.sonara.music`.
   * The device is verified secure (`MEETS_DEVICE_INTEGRITY`).

---

## 4. R8 / ProGuard Obfuscation Rules

ProGuard definitions in `proguard-rules.pro` protect proprietary algorithms and third-party SDK elements from decompilation tools (e.g., JADX):

```properties
# Obfuscation guidelines and R8 memory optimization rules
-keep class com.sonara.music.data.model.** { *; }
-keepattributes Signature,Exceptions,*Annotation*,InnerClasses,EnclosingMethod

# ExoPlayer Media3 reflection bindings
-keep class androidx.media3.common.** { *; }
-keep class androidx.media3.exoplayer.** { *; }
-keep class androidx.media3.session.** { *; }

# Dagger Hilt Reflection definitions
-keep class dagger.hilt.** { *; }
-keepattributes *Annotation*,Signature

# Room persistent database optimization bounds
-keep class * extends androidx.room.RoomDatabase
-keep class * implements androidx.room.RoomOpenHelper
```
