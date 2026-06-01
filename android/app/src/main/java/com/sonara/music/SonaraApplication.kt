package com.sonara.music

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.sonara.music.security.SecurityManager
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class SonaraApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var securityManager: SecurityManager

    override fun onCreate() {
        super.onCreate()
        
        // Runtime environment verification (Root, Debugger Attachment, Hook checks)
        securityManager.validateRuntimeEnvironment(this)
        
        // Setup Media notifications channels
        createPlaybackNotificationChannels()
    }

    private fun createPlaybackNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "sonara_playback_channel",
                "Playback Control",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Media Session Lockscreen controls and audio stream sync states"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
