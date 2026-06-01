# Build Validation Report - Sonara Android Project

This audit presents compile targets, task configurations, dependency chains, and binary compiler settings applied to assemble Sonara release formats.

---

## 1. Compiler Target Configurations

| Component | Setting Value | Purpose / Notes |
| :--- | :--- | :--- |
| **Compile SDK Version** | 34 | Fully compatible with latest Android API 14 / 15 features. |
| **Min SDK Version** | 26 | Restricts execution to Oreo (Android 8.0+) to support secure hardware isolation. |
| **Target SDK Version** | 34 | Promotes runtime behavior patterns corresponding to Play Store targets. |
| **Java / JVM Version** | 17 | Ensured modern build features, fast garbage collection, and robust generic loops. |
| **Kotlin Compiler Hook**| 1.5.8 | Paired with Compose BOM for strict types on Jetpack UI compilation models. |

---

## 2. Dependency Graph Integration

The complete verified dependency graph configured in `app/build.gradle.kts` uses stable architectures:

* **Dependency Injection**: Dagger Hilt 2.50 + KSP Compiler Toolchains.
* **Database Persistency**: Room 2.6.1 + KSP.
* **Media Sync Pipeline**: ExoPlayer + MediaSession Engine v1.2.1.
* **Background Scheduler**: Jetpack WorkManager 2.9.0.
* **User Settings Engine**: Encrypted DataStore Preferences 1.0.0.
* **FCM + Crashlytics Blocks**: Firebase BOM 32.7.2 + Google-services 4.4.0.

---

## 3. Play Store Compilation Outputs

| Build Option | Shell Compile Command | Output Binary Format | Production Usage |
| :--- | :--- | :--- | :--- |
| **Debug Binary** | `./gradlew assembleDebug` | `app-debug.apk` | Internal development, local instrumentation, and USB sideload testing. |
| **Release Binary** | `./gradlew assembleRelease` | `app-release.apk` | Distribution via enterprise networks or direct download endpoints. |
| **Release Bundle** | `./gradlew bundleRelease` | `app-release.aab` | Official Google Play Store production submission format. Contains split resources. |

---

## 4. Compilation Integrity Measures

* **Resource Shrinking & ProGuard**: Enabled in release mode via `isMinifyEnabled = true`, stripping dead assets and class definitions to minimize overall application bundle footprints.
* **Deterministic Build Parameters**: Keystore file paths are structured to resolve from environment strings. This prevents hardcoded secret credential exposure inside repository commits.
