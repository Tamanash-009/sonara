# Sonara API Documentation

As Sonara is designed with a strict offline-first paradigm, its "API" primarily concerns internal integrations rather than external web service communications. 

## Internal Interfaces

### 1. `TrackRepository`
Manages the source of truth for audio files.
- `suspend fun getAllTracks(): Flow<List<Track>>` - Retrieves the full local library observing real-time updates.
- `suspend fun scanLocalMedia()` - Triggers a MediaStore query to discover new MP3, FLAC, and WAV files.

### 2. `MediaPlaybackService`
Manages the audio focus and lifecycle using Media3.
- Binds to the system's `MediaSession`.
- Handles `PLAY`, `PAUSE`, `SKIP`, and `SEEK` intents.

### 3. `SecurityManager`
Handles the integration with Play Integrity.
- `fun requestPlayIntegrityToken(nonce: String)` - Requests a device attestation token to verify the environment.

### 4. `PlaylistSyncWorker`
- Executes background synchronization tasks based on `WorkManager` constraints.
- Utilizes `CoroutineWorker` for safe threading.
