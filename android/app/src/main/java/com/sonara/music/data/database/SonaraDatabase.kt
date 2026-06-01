package com.sonara.music.data.database

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import com.sonara.music.data.model.Track
import kotlinx.coroutines.flow.Flow

@Dao
interface TrackDao {
    @Query("SELECT * FROM tracks")
    fun getAllTracks(): Flow<List<Track>>

    @Query("SELECT * FROM tracks WHERE isDownloaded = 1")
    fun getDownloadedTracks(): Flow<List<Track>>

    @Query("SELECT * FROM tracks WHERE id = :id")
    suspend fun getTrackById(id: String): Track?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrack(track: Track)

    @Query("UPDATE tracks SET isDownloaded = :downloaded, localFilePath = :filePath WHERE id = :id")
    suspend fun updateDownloadStatus(id: String, downloaded: Boolean, filePath: String?)

    @Query("DELETE FROM tracks WHERE id = :id")
    suspend fun deleteTrack(id: String)
}

@Database(entities = [Track::class], version = 1, exportSchema = false)
abstract class SonaraDatabase : RoomDatabase() {
    abstract fun trackDao(): TrackDao
}
