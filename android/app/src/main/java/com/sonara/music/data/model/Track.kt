package com.sonara.music.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tracks")
data class Track(
    @PrimaryKey val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val url: String,
    val coverUrl: String,
    val durationMs: Long,
    val isDownloaded: Boolean = false,
    val localFilePath: String? = null
)
