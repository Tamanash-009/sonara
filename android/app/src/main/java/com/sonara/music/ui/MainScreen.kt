package com.sonara.music.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.sonara.music.data.model.Track
import com.sonara.music.ui.equalizer.EqualizerViewModel

import androidx.hilt.navigation.compose.hiltViewModel

sealed class ScreenTab(val route: String, val title: String) {
    object Home : ScreenTab("home", "Home Player")
    object Equalizer : ScreenTab("equalizer", "System EQ")
    object Downloads : ScreenTab("downloads", "Offline Storage")
}

@Composable
fun MainScreen(
    mainViewModel: MainViewModel = hiltViewModel(),
    equalizerViewModel: EqualizerViewModel = EqualizerViewModel()
) {
    val tracks by mainViewModel.tracks.collectAsState()
    val downloadedTracks by mainViewModel.downloadedTracks.collectAsState()
    var selectedTab by remember { mutableStateOf<ScreenTab>(ScreenTab.Home) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                listOf(ScreenTab.Home, ScreenTab.Equalizer, ScreenTab.Downloads).forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        label = { Text(tab.title, style = MaterialTheme.typography.labelSmall) },
                        icon = {
                            val icon = when (tab) {
                                ScreenTab.Home -> Icons.Default.PlayArrow
                                ScreenTab.Equalizer -> Icons.Default.Settings
                                ScreenTab.Downloads -> Icons.Default.ArrowDropDown
                            }
                            Icon(icon, contentDescription = tab.title)
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.background,
                            Color(0xFF0F172A)
                        )
                    )
                )
        ) {
            when (selectedTab) {
                ScreenTab.Home -> HomeScreenContent(tracks)
                ScreenTab.Equalizer -> EqualizerScreenContent(equalizerViewModel)
                ScreenTab.Downloads -> DownloadScreenContent(downloadedTracks)
            }
        }
    }
}

@Composable
fun HomeScreenContent(tracks: List<Track>) {
    var currentPlayingTrack by remember { mutableStateOf<Track?>(tracks.firstOrNull()) }
    var runningState by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Main Dynamic Card Header
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(bottom = 24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(32.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(64.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = currentPlayingTrack?.title ?: "No Sound Loaded",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )
                Text(
                    text = currentPlayingTrack?.artist ?: "Hifi Sound Pipeline",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }

        // Playback dashboard control buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { /* Previous Item */ },
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color.White.copy(alpha = 0.05f))
            ) {
                Icon(Icons.Default.List, contentDescription = "Previous", tint = Color.White)
            }

            Button(
                onClick = { runningState = !runningState },
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                contentPadding = PaddingValues(16.dp),
                modifier = Modifier.size(72.dp)
            ) {
                Icon(
                    imageVector = if (runningState) Icons.Default.Close else Icons.Default.PlayArrow,
                    contentDescription = "Toggle Player State",
                    tint = Color.Black,
                    modifier = Modifier.size(32.dp)
                )
            }

            IconButton(
                onClick = { /* Next Item */ },
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color.White.copy(alpha = 0.05f))
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = "Next", tint = Color.White)
            }
        }
    }
}

@Composable
fun EqualizerScreenContent(viewModel: EqualizerViewModel) {
    val state by viewModel.equalizerState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Equalizer Channels", style = MaterialTheme.typography.titleLarge, color = Color.White)
            Switch(
                checked = state.enabled,
                onCheckedChange = { viewModel.toggleEqualizer() }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Preset capsules
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("Flat", "Rock", "Pop", "Classical", "Bass Boost").forEach { pr ->
                val isSelected = state.preset == pr
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.05f))
                        .clickable { viewModel.applyPredefinedPreset(pr) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        pr,
                        style = MaterialTheme.typography.labelMedium,
                        color = if (isSelected) Color.Black else Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Visual equalizer lines
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(state.bands.size) { bandIdx ->
                val band = state.bands[bandIdx]
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("${band.frequency} Hz", color = Color.White, style = MaterialTheme.typography.bodyMedium)
                        Text("${band.gain.toInt()} dB", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
                    }
                    Slider(
                        value = band.gain,
                        onValueChange = { viewModel.modifyBandGain(bandIdx, it) },
                        valueRange = -12f..12f,
                        enabled = state.enabled,
                        colors = SliderDefaults.colors(
                            activeTrackColor = MaterialTheme.colorScheme.primary,
                            inactiveTrackColor = Color.White.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun DownloadScreenContent(tracks: List<Track>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Offline Downloader", style = MaterialTheme.typography.titleLarge, color = Color.White)
            Spacer(modifier = Modifier.height(16.dp))
        }

        items(tracks) { item ->
            var downloadPercent by remember { mutableStateOf(0f) }
            var isDown by remember { mutableStateOf(false) }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.03f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(item.title, style = MaterialTheme.typography.titleMedium, color = Color.White)
                        Text(item.artist, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                    }

                    Button(
                        onClick = {
                            if (!isDown) {
                                isDown = true
                                downloadPercent = 1f
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isDown) Color.LightGray.copy(alpha = 0.2f) else MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Text(
                            if (isDown) "Downloaded" else "Save Offline",
                            color = if (isDown) Color.White else Color.Black,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            }
        }
    }
}
