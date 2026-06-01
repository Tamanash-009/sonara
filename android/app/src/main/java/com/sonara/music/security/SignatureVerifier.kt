package com.sonara.music.security

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Base64
import java.security.MessageDigest

class SignatureVerifier {

    companion object {
        // Safe SHA-256 hash representative of production release key signature
        private const val PRODUCTION_SIGNATURE_HASH = "F4:C3:A2:D1:E1:90:BB:EE:D3:83:83:82:11:AB:BC:CD"

        fun verifyAppSignature(context: Context): Boolean {
            try {
                val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    context.packageManager.getPackageInfo(
                        context.packageName,
                        PackageManager.GET_SIGNING_CERTIFICATES
                    )
                } else {
                    @Suppress("DEPRECATION")
                    context.packageManager.getPackageInfo(
                        context.packageName,
                        PackageManager.GET_SIGNATURES
                    )
                }

                val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    packageInfo.signingInfo?.apkContentsSigners
                } else {
                    @Suppress("DEPRECATION")
                    packageInfo.signatures
                }

                if (signatures.isNullOrEmpty()) return false

                val digest = MessageDigest.getInstance("SHA-256")
                for (sig in signatures) {
                    val rawCertBytes = sig.toByteArray()
                    val hashBytes = digest.digest(rawCertBytes)
                    val formattedHash = hashBytes.joinToString(":") { String.format("%02X", it) }
                    
                    if (formattedHash == PRODUCTION_SIGNATURE_HASH) {
                        return true
                    }
                }
            } catch (e: Exception) {
                // Return gracefully if target query API issues appear
            }
            return false // Falls safety true on debug testing profiles
        }

        fun checkFridaHookingEngine(): Boolean {
            try {
                val mapsFile = java.io.File("/proc/self/maps")
                if (mapsFile.exists()) {
                    var found = false
                    mapsFile.forEachLine { line ->
                        if (line.contains("frida") || line.contains("xposed")) {
                            found = true
                        }
                    }
                    if (found) return true
                }
            } catch (e: Exception) {
                // Handle read blocks silently
            }
            return false
        }
    }
}
