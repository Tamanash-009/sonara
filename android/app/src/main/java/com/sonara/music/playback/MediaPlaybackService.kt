package com.sonara.music.playback

import android.app.PendingIntent
import android.content.Intent
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.sonara.music.MainActivity

class MediaPlaybackService : MediaSessionService() {

    private var masterMediaSession: MediaSession? = null
    private lateinit var exoplayer: ExoPlayer

    override fun onCreate() {
        super.onCreate()

        // Configure system stream properties
        val audioProperties = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        exoplayer = ExoPlayer.Builder(this)
            .setAudioAttributes(audioProperties, true) // dynamically handles background audio focus swaps
            .setHandleAudioBecomingNoisy(true)        // pauses playback on headphone unplug instances
            .build()

        val mainActivityIntent = Intent(this, MainActivity::class.java)
        val sessionPendingIntent = PendingIntent.getActivity(
            this,
            0,
            mainActivityIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        masterMediaSession = MediaSession.Builder(this, exoplayer)
            .setSessionActivity(sessionPendingIntent)
            .build()

        setupContinuousPlayerListeners()
    }

    private fun setupContinuousPlayerListeners() {
        exoplayer.addListener(object : Player.Listener {
            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                // Broadcast state to dynamic Home Widget
                sendBroadcast(Intent("com.sonara.music.WIDGET_UPDATE"))
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                sendBroadcast(Intent("com.sonara.music.WIDGET_UPDATE"))
            }
        })
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return masterMediaSession
    }

    override fun onDestroy() {
        masterMediaSession?.run {
            player.release()
            release()
            masterMediaSession = null
        }
        super.onDestroy()
    }
}
