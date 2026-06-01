# Sonara Architecture

Sonara is built using modern Android architecture components, strictly adhering to the Clean Architecture and MVVM (Model-View-ViewModel) patterns.

## Tech Stack
- **Language:** Kotlin
- **UI:** Jetpack Compose (Material 3)
- **Dependency Injection:** Dagger Hilt
- **Asynchronous Programming:** Kotlin Coroutines & Flow
- **Local Database:** Room Database
- **Background Tasks:** WorkManager
- **Networking:** Retrofit & OkHttp
- **Media Playback:** Media3 (ExoPlayer)
- **Security:** Jetpack Security (EncryptedSharedPreferences) & Play Integrity API

## Layers
1. **UI Layer (Presentation):** Compose screens and ViewModels. ViewModels expose UI state using StateFlows.
2. **Domain Layer:** Contains UseCases and Domain Models. Represents the core business logic.
3. **Data Layer:** Repository implementations, Room DAOs, Data Sources, and API services.

## Core Components
- **MediaPlaybackService:** A MediaLibraryService managing the ExoPlayer instance and handling background playback.
- **PlaylistSyncWorker:** A CoroutineWorker responsible for synchronizing metadata when network conditions allow.
- **SecurityManager:** Handles root detection, SSL pinning validation, and Play Integrity checks.
