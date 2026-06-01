package com.sonara.music.security

import android.content.Context
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class IntegrityManager @Inject constructor() {

    suspend fun getIntegrityToken(context: Context, nonce: String): String? {
        return try {
            val integrityManager = IntegrityManagerFactory.create(context)
            val request = IntegrityTokenRequest.builder()
                .setCloudProjectNumber(1234567890)
                .setNonce(nonce)
                .build()

            val response = integrityManager.requestIntegrityToken(request).await()
            response.token()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
