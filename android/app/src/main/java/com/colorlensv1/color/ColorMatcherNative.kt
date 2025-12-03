package com.colorlensv1.color

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import kotlin.math.pow

/**
 * Native CIELAB + ΔE2000 color matcher for fast fallback detection.
 * Precomputes Lab values for all colors in the dataset at initialization.
 */
class ColorMatcherNative(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    data class ColorEntry(
        val name: String,
        val hex: String,
        val family: String?,
        val rgb: IntArray,
        val lab: DoubleArray  // [L*, a*, b*]
    )

    private var dataset: List<ColorEntry> = emptyList()
    private var initialized = false
    private val DEBUG = false // Set to true for debugging

    override fun getName(): String {
        return "ColorMatcherNative"
    }

    @ReactMethod
    fun initialize(callback: Callback) {
        if (initialized) {
            callback.invoke(null, true)
            return
        }

        try {
            if (DEBUG) println("ColorMatcherNative: Loading colormodel.json from assets...")
            val inputStream = reactApplicationContext.assets.open("colormodel.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            val jsonString = reader.use { it.readText() }
            val jsonArray = JSONArray(jsonString)

            if (DEBUG) println("ColorMatcherNative: Parsing ${jsonArray.length()} colors and computing Lab...")
            dataset = (0 until jsonArray.length()).mapNotNull { i ->
                try {
                    val obj = jsonArray.getJSONObject(i)
                    val name = obj.getString("name")
                    val hex = obj.optString("hex", "#000000").trim()
                    val family = obj.optString("family", null).takeIf { !it.isNullOrEmpty() }
                    
                    // Get RGB from JSON (prefer rgb array, fallback to hex parsing)
                    val rgb = if (obj.has("rgb") && obj.getJSONArray("rgb").length() >= 3) {
                        val rgbArray = obj.getJSONArray("rgb")
                        intArrayOf(
                            rgbArray.getInt(0).coerceIn(0, 255),
                            rgbArray.getInt(1).coerceIn(0, 255),
                            rgbArray.getInt(2).coerceIn(0, 255)
                        )
                    } else {
                        // Parse from hex
                        val hexClean = hex.removePrefix("#")
                        intArrayOf(
                            hexClean.substring(0, 2).toInt(16).coerceIn(0, 255),
                            hexClean.substring(2, 4).toInt(16).coerceIn(0, 255),
                            hexClean.substring(4, 6).toInt(16).coerceIn(0, 255)
                        )
                    }

                    // Convert RGB to Lab
                    val lab = LabColor.rgbToLab(rgb[0], rgb[1], rgb[2])
                    
                    ColorEntry(name, hex, family, rgb, lab)
                } catch (e: Exception) {
                    if (DEBUG) println("ColorMatcherNative: Error parsing color entry $i: ${e.message}")
                    null
                }
            }

            initialized = true
            if (DEBUG) println("ColorMatcherNative: Initialized successfully with ${dataset.size} colors")
            callback.invoke(null, true)
        } catch (e: Exception) {
            println("ColorMatcherNative: Failed to initialize - ${e.message}")
            callback.invoke(e.message, null)
        }
    }

    @ReactMethod
    fun findClosestColor(r: Int, g: Int, b: Int, topN: Int, callback: Callback) {
        if (!initialized || dataset.isEmpty()) {
            callback.invoke("not_initialized", null)
            return
        }

        try {
            val rClamped = r.coerceIn(0, 255)
            val gClamped = g.coerceIn(0, 255)
            val bClamped = b.coerceIn(0, 255)

            // Check if input is white/near-white - prioritize white matches
            // More lenient threshold to match Color Meter accuracy
            // RGB >= 180 with low delta is considered white (catches #C0C0C0, #bebdbc, etc.)
            val isWhite = run {
                val minVal = minOf(rClamped, gClamped, bClamped)
                val maxVal = maxOf(rClamped, gClamped, bClamped)
                val delta = maxVal - minVal
                // Lowered threshold: min >= 180 (light/white) and delta <= 35 (very neutral)
                minVal >= 180 && delta <= 35
            }
            
            // Check if input is very bright white (RGB >= 220)
            val isVeryWhite = run {
                val minVal = minOf(rClamped, gClamped, bClamped)
                val maxVal = maxOf(rClamped, gClamped, bClamped)
                val delta = maxVal - minVal
                minVal >= 220 && delta <= 25
            }

            // Convert detected RGB to Lab
            val detectedLab = LabColor.rgbToLab(rClamped, gClamped, bClamped)
            
            if (detectedLab.size < 3 || detectedLab[0].isNaN() || detectedLab[1].isNaN() || detectedLab[2].isNaN()) {
                callback.invoke("invalid_lab_conversion", null)
                return
            }

            // Prefilter: Find top 40 candidates by RGB distance (fast)
            val prefilterCount = minOf(40, dataset.size)
            val rgbCandidates = dataset.map { entry ->
                val dr = rClamped - entry.rgb[0]
                val dg = gClamped - entry.rgb[1]
                val db = bClamped - entry.rgb[2]
                val dist2 = dr * dr + dg * dg + db * db
                Pair(entry, dist2)
            }
                .sortedBy { it.second }
                .take(prefilterCount)
                .map { it.first }

            // Calculate ΔE2000 distance for each candidate
            val results = rgbCandidates.map { entry ->
                var distance = LabColor.deltaE2000(detectedLab, entry.lab)
                
                // If input is white/near-white, prioritize white over gray
                if (isWhite) {
                    val entryName = entry.name.lowercase()
                    val entryFamily = entry.family?.lowercase() ?: ""
                    
                    // Check if entry is actually white by RGB values
                    val entryR = entry.rgb[0]
                    val entryG = entry.rgb[1]
                    val entryB = entry.rgb[2]
                    val entryMin = minOf(entryR, entryG, entryB)
                    val entryMax = maxOf(entryR, entryG, entryB)
                    val entryDelta = entryMax - entryMin
                    // Match the same thresholds as input detection
                    val isEntryWhite = entryMin >= 180 && entryDelta <= 35
                    val isEntryVeryWhite = entryMin >= 220 && entryDelta <= 25
                    
                    // Check if entry is gray (darker than white, but still light)
                    val isEntryGray = entryMin >= 120 && entryMin < 180 && entryDelta <= 35
                    
                    // Prioritize white over gray - white gets much stronger boost
                    if (isEntryVeryWhite || (isEntryWhite && (entryName.contains("white") || entryFamily.contains("white")))) {
                        // Very strong boost for white colors when input is white
                        distance *= if (isVeryWhite) 0.1 else 0.15
                    } else if (isEntryWhite || entryName.contains("white") || entryFamily.contains("white")) {
                        // Strong boost for white colors
                        distance *= 0.2
                    } else if (isEntryGray || entryName.contains("gray") || entryName.contains("grey") || 
                               entryFamily.contains("gray") || entryFamily.contains("grey")) {
                        // Moderate boost for gray, but less than white
                        distance *= 0.5
                    } else if (entryName.contains("neutral") || entryFamily.contains("neutral")) {
                        // Small boost for neutral colors
                        distance *= 0.7
                    } else {
                        // Strongly penalize non-white/gray colors when input is white
                        distance *= 2.5
                    }
                }
                
                // Convert distance to confidence (ΔE2000 mapping)
                val confidence = (100.0 - (distance * 3.0)).coerceIn(0.0, 100.0)
                
                Triple(entry, distance, confidence)
            }
                .sortedBy { it.second }  // Sort by distance (ascending)
                .take(topN)

            // Build result
            val result: WritableMap = Arguments.createMap().apply {
                // Detected color info
                putArray("detected_color_rgb", Arguments.createArray().apply {
                    pushInt(rClamped)
                    pushInt(gClamped)
                    pushInt(bClamped)
                })
                putString("detected_color_hex", String.format("#%02x%02x%02x", rClamped, gClamped, bClamped))

                // Closest match
                if (results.isNotEmpty()) {
                    val closest = results[0]
                    val closestEntry = closest.first
                    putMap("closest_match", Arguments.createMap().apply {
                        putString("name", closestEntry.name)
                        putString("hex", closestEntry.hex)
                        if (closestEntry.family != null) {
                            putString("family", closestEntry.family)
                        }
                        putDouble("deltaE", closest.second)
                        putInt("confidence", closest.third.toInt())
                    })
                }

                // Alternatives
                val alternativesArray: WritableArray = Arguments.createArray()
                results.drop(1).forEach { (entry, distance, confidence) ->
                    alternativesArray.pushMap(Arguments.createMap().apply {
                        putString("name", entry.name)
                        putString("hex", entry.hex)
                        if (entry.family != null) {
                            putString("family", entry.family)
                        }
                        putDouble("deltaE", distance)
                        putInt("confidence", confidence.toInt())
                    })
                }
                putArray("alternatives", alternativesArray)
            }

            callback.invoke(null, result)
        } catch (e: Exception) {
            println("ColorMatcherNative: Error finding closest color - ${e.message}")
            callback.invoke(e.message, null)
        }
    }

    @ReactMethod
    fun isInitialized(callback: Callback) {
        callback.invoke(null, initialized)
    }
}

