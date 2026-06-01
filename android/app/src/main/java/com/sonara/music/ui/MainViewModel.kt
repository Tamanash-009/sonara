package com.sonara.music.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonara.music.data.model.Track
import com.sonara.music.data.repository.TrackRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val trackRepository: TrackRepository
) : ViewModel() {

    private val _tracks = MutableStateFlow<List<Track>>(emptyList())
    val tracks: StateFlow<List<Track>> = _tracks.asStateFlow()

    private val _downloadedTracks = MutableStateFlow<List<Track>>(emptyList())
    val downloadedTracks: StateFlow<List<Track>> = _downloadedTracks.asStateFlow()

    init {
        // Initialize the database with an empty list for production
        // and fetch real entries later, or allow syncing.
        viewModelScope.launch {
            trackRepository.getAllTracks().collect { list ->
                _tracks.value = list
            }
        }
        viewModelScope.launch {
            trackRepository.getDownloadedTracks().collect { list ->
                _downloadedTracks.value = list
            }
        }
    }
}
