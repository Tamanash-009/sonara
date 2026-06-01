package com.sonara.music.data.repository

import com.sonara.music.data.database.TrackDao
import com.sonara.music.data.model.Track
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TrackRepository @Inject constructor(
    private val trackDao: TrackDao
) {
    fun getAllTracks(): Flow<List<Track>> = trackDao.getAllTracks()

    fun getDownloadedTracks(): Flow<List<Track>> = trackDao.getDownloadedTracks()

    suspend fun getTrackById(id: String): Track? = trackDao.getTrackById(id)

    suspend fun insertTrack(track: Track) {
        trackDao.insertTrack(track)
    }

    suspend fun updateDownloadStatus(id: String, isDownloaded: Boolean, localFilePath: String?) {
        trackDao.updateDownloadStatus(id, isDownloaded, localFilePath)
    }

    suspend fun deleteTrack(id: String) {
        trackDao.deleteTrack(id)
    }
}
