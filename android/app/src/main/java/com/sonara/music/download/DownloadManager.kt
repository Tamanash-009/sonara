package com.sonara.music.download

import android.content.Context
import com.sonara.music.data.database.TrackDao
import com.sonara.music.data.model.Track
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DownloadManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val trackDao: TrackDao
) {
    private val _downloadingProgress = MutableStateFlow<Map<String, Float>>(emptyMap())
    val downloadingProgress = _downloadingProgress.asStateFlow()

    suspend fun downloadTrack(track: Track) = withContext(Dispatchers.IO) {
        val storageDir = File(context.getExternalFilesDir(null), "tracks")
        if (!storageDir.exists()) {
            storageDir.mkdirs()
        }

        val targetFile = File(storageDir, "${track.id}.mp3")
        if (targetFile.exists()) {
            trackDao.updateDownloadStatus(track.id, true, targetFile.absolutePath)
            return@withContext
        }

        try {
            val url = URL(track.url)
            val connection = url.openConnection()
            connection.connect()

            val totalBytes = connection.contentLength
            val input = url.openStream()
            val output = targetFile.outputStream()

            val streamBuffer = ByteArray(4096)
            var downloadedBytes: Long = 0
            var readCount: Int

            while (input.read(streamBuffer).also { readCount = it } != -1) {
                downloadedBytes += readCount
                if (totalBytes > 0) {
                    val floatProgress = downloadedBytes.toFloat() / totalBytes.toFloat()
                    _downloadingProgress.value = _downloadingProgress.value.toMutableMap().apply {
                        put(track.id, floatProgress)
                    }
                }
                output.write(streamBuffer, 0, readCount)
            }

            output.flush()
            output.close()
            input.close()

            trackDao.updateDownloadStatus(track.id, true, targetFile.absolutePath)
        } catch (e: Exception) {
            targetFile.delete() // dynamic rollback of broken file chunks
            throw e
        }
    }
}
