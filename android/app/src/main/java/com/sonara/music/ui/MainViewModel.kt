package com.sonara.music.ui

import android.content.ComponentName
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import com.sonara.music.data.model.Track
import com.sonara.music.data.repository.TrackRepository
import com.sonara.music.playback.MediaPlaybackService
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val trackRepository: TrackRepository
) : ViewModel() {

    private val _tracks = MutableStateFlow<List<Track>>(emptyList())
    val tracks: StateFlow<List<Track>> = _tracks.asStateFlow()

    private val _downloadedTracks = MutableStateFlow<List<Track>>(emptyList())
    val downloadedTracks: StateFlow<List<Track>> = _downloadedTracks.asStateFlow()

    private val _currentTrack = MutableStateFlow<Track?>(null)
    val currentTrack: StateFlow<Track?> = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private var mediaControllerFuture: ListenableFuture<MediaController>? = null
    private var mediaController: MediaController? = null

    init {
        viewModelScope.launch {
            seedDemoTracksIfEmpty()
            trackRepository.getAllTracks().collect { list ->
                _tracks.value = list
                if (mediaController != null && mediaController!!.mediaItemCount == 0 && list.isNotEmpty()) {
                    setPlaylist(list)
                }
            }
        }
        viewModelScope.launch {
            trackRepository.getDownloadedTracks().collect { list ->
                _downloadedTracks.value = list
            }
        }
        initializeMediaController()
    }

    private suspend fun seedDemoTracksIfEmpty() {
        val currentTracks = trackRepository.getAllTracks().first()
        if (currentTracks.isEmpty()) {
            val demoTracks = listOf(
                Track("1", "Neon Sunset", "Synthwave Horizon", "Vibes 2026", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=512", 300000),
                Track("2", "Electric Dream", "Cyber Pulse", "Vibes 2026", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=512", 300000),
                Track("3", "Lofi Rain", "Chill Beats", "Vibes 2026", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=512", 300000)
            )
            demoTracks.forEach { trackRepository.insertTrack(it) }
        }
    }

    private fun initializeMediaController() {
        val sessionToken = SessionToken(context, ComponentName(context, MediaPlaybackService::class.java))
        mediaControllerFuture = MediaController.Builder(context, sessionToken).buildAsync()
        mediaControllerFuture?.addListener({
            mediaController = mediaControllerFuture?.get()
            mediaController?.addListener(playerListener)
            
            // Set initial playlist if tracks are already loaded
            if (_tracks.value.isNotEmpty()) {
                setPlaylist(_tracks.value)
            }
        }, MoreExecutors.directExecutor())
    }

    private val playerListener = object : Player.Listener {
        override fun onIsPlayingChanged(isPlaying: Boolean) {
            _isPlaying.value = isPlaying
        }

        override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
            val trackId = mediaItem?.mediaId
            if (trackId != null) {
                _currentTrack.value = _tracks.value.find { it.id == trackId }
            } else {
                _currentTrack.value = null
            }
        }
    }

    private fun setPlaylist(trackList: List<Track>) {
        val controller = mediaController ?: return
        val mediaItems = trackList.map { track ->
            MediaItem.Builder()
                .setMediaId(track.id)
                .setUri(track.url)
                .setMediaMetadata(
                    MediaMetadata.Builder()
                        .setTitle(track.title)
                        .setArtist(track.artist)
                        .setAlbumTitle(track.album)
                        .build()
                )
                .build()
        }
        controller.setMediaItems(mediaItems)
        controller.prepare()
        if (mediaItems.isNotEmpty()) {
            _currentTrack.value = trackList.first()
        }
    }

    fun togglePlayPause() {
        val controller = mediaController ?: return
        if (controller.isPlaying) {
            controller.pause()
        } else {
            controller.play()
        }
    }

    fun skipToNext() {
        mediaController?.seekToNextMediaItem()
    }

    fun skipToPrevious() {
        mediaController?.seekToPreviousMediaItem()
    }

    override fun onCleared() {
        super.onCleared()
        mediaControllerFuture?.let {
            MediaController.releaseFuture(it)
        }
    }
}
