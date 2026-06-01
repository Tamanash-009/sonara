package com.sonara.music.download

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkRequest
import com.sonara.music.data.database.TrackDao
import androidx.hilt.work.HiltWorker
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.io.File

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val trackDao: TrackDao,
    private val downloadManager: DownloadManager
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            trackDao.getDownloadedTracks().collect { tracks ->
                for (track in tracks) {
                    // Recover files from local cache disk errors or corrupted sizes
                    val file = track.localFilePath?.let { File(it) }
                    if (file == null || !file.exists() || file.length() == 0L) {
                        downloadManager.downloadTrack(track)
                    }
                }
            }
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        fun buildWorkRequest(): WorkRequest {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED) // Download exclusively on unmetered profiles (WiFi)
                .setRequiresBatteryNotLow(true)
                .setRequiresStorageNotLow(true)
                .build()

            return OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()
        }
    }
}
