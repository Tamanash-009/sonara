# Firebase Implementation Report - Sonara Android Project

This audit presents the integration patterns, custom events, and delivery structures applied using the Google Firebase SDK.

---

## 1. Firebase Analytics Measurement Schema

To gain granular visibility into active listening patterns without compromising privacy, Sonara tracks key events using the Firebase SDK:

| Event Identifier | Parameter Keys | Event Type | Description |
| :--- | :--- | :--- | :--- |
| `playback_session_started` | `track_id`, `artist`, `media_source` | Custom Event | Dispatched when a track begins playing. |
| `playback_duration` | `duration_seconds`, `completed` | Custom Event | Tracks how long users engage with an audio stream. |
| `download_engagement` | `track_id`, `compression_kbps`, `origin` | Custom Event | Captured on completion of offline track download. |
| `equalizer_modified` | `preset_selected`, `band_gains` | Custom Event | Dispatched when a preset or manual gain band is changed. |
| `user_session_heartbeat` | `network_profile_wifi`, `active_tab` | Session Heartbeat | Tracks dynamic engagement cycles over daily lifespans. |

---

## 2. Firebase Crashlytics & ANR Diagnostics

Sonara is configured to log accurate diagnostic states. This enables engineering teams to quickly resolve production issues:

* **Automatic Log Bundles**:
  Enforces automatic upload of fatal crashes, stack traces, and Native C++ issues (under target Audio JNI modules) directly to the Crashlytics Dashboard.
* **Custom Keys Added**:
  To speed up troubleshooting without recording personally identifiable information (PII), we tag diagnostic snapshots with critical runtime variables:
  * `disk_free_space_mb`
  * `network_status_wifi`
  * `exoplayer_playback_state`
  * `keystore_available_hardware`
* **Non-fatal Exception Logging**:
  Caught exceptions in background workers (such as temporary network drops inside `SyncWorker`) are logged as non-fatal events to avoid cluttering primary crash lists.

---

## 3. Firebase Cloud Messaging (FCM) & Deep Links

Provides interactive notifications and seamless navigation using modern push payload standards:

* **Notification Channel**: All incoming playback messages resolve under Category ID `sonara_playback_channel` with low importance to avoid interrupting ongoing music.
* **Token Registration Flow**:
  1. Token generation on first startup via `FirebaseMessaging.getInstance().token`.
  2. Secure transmission of tokens to Sonara's central server.
  3. Dynamic grouping of tokens into distinct listening channels.
* **FCM Deep Link Mapping**:
  FCM push payloads include a key-value data parameter `click_action_url` mapped to `https://sonara.music/track/{id}`. This deep link intent automatically triggers MainActivity to load and play the specified track immediately.
