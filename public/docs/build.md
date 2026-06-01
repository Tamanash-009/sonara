# Build Guide

This document details how to compile Sonara from source.

## Prerequisites
- **JDK:** Java 17 or higher
- **Android SDK:** API Level 34 (Android 14)
- **Build Tools:** 34.0.0
- **Gradle:** 8.4+

## Generating Artifacts
Execute the following Gradle wrapper commands from the `android` directory:

* **Clean:** `./gradlew clean`
* **Debug APK:** `./gradlew assembleDebug`
* **Release APK:** `./gradlew assembleRelease`
* **App Bundle (AAB):** `./gradlew bundleRelease`

## Production Signing
To create a signed release build, export your keystore credentials as environment variables before running the build command:
```bash
export KEYSTORE_PASSWORD="your-password"
export KEY_PASSWORD="your-password"
./gradlew assembleRelease
```
