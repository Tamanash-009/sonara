package com.sonara.music.ui.equalizer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EqualizerBand(
    val frequency: Int,
    var gain: Float
)

data class EqualizerConfig(
    val enabled: Boolean,
    val preset: String,
    val bands: List<EqualizerBand>
)

class EqualizerViewModel : ViewModel() {

    private val _equalizerState = MutableStateFlow(
        EqualizerConfig(
            enabled = true,
            preset = "Flat",
            bands = listOf(
                EqualizerBand(60, 0f),
                EqualizerBand(230, 0f),
                EqualizerBand(910, 0f),
                EqualizerBand(4000, 0f),
                EqualizerBand(14000, 0f)
            )
        )
    )
    val equalizerState = _equalizerState.asStateFlow()

    fun toggleEqualizer() {
        _equalizerState.value = _equalizerState.value.copy(
            enabled = !_equalizerState.value.enabled
        )
    }

    fun modifyBandGain(frequencyIndex: Int, newGain: Float) {
        val bandsCollection = _equalizerState.value.bands.toMutableList()
        if (frequencyIndex in bandsCollection.indices) {
            bandsCollection[frequencyIndex] = bandsCollection[frequencyIndex].copy(gain = newGain)
            _equalizerState.value = _equalizerState.value.copy(bands = bandsCollection)
        }
    }

    fun applyPredefinedPreset(presetName: String) {
        val targetGains = when (presetName) {
            "Rock" -> listOf(4f, 2f, -1f, 3f, 5f)
            "Pop" -> listOf(-1f, 1f, 3f, 2f, -1f)
            "Classical" -> listOf(3f, 2f, 0f, 2f, 4f)
            "Bass Boost" -> listOf(6f, 4f, 0f, -1f, -2f)
            else -> listOf(0f, 0f, 0f, 0f, 0f)
        }
        val bandsCollection = _equalizerState.value.bands.mapIndexed { idx, band ->
            band.copy(gain = targetGains.getOrElse(idx) { 0f })
        }
        _equalizerState.value = _equalizerState.value.copy(
            preset = presetName,
            bands = bandsCollection
        )
    }
}
