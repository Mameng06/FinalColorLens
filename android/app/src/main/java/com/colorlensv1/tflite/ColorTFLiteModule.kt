package com.colorlensv1.tflite

import com.colorlensv1.color.Cam16Ucs
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.tensorflow.lite.Interpreter
import kotlin.math.roundToInt

class ColorTFLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val helper = ColorTFLiteHelper(reactContext.applicationContext)
    private var labelCount: Int = 0

    override fun getName(): String {
        return "ColorTFLite"
    }

    @ReactMethod
    fun loadModel(callback: Callback) {
        try {
            println("ColorTFLite: Starting to load color_model.tflite...")
            helper.loadModel()
            labelCount = helper.getLabelCount()
            println("ColorTFLite: Model loaded successfully! Label count: $labelCount")
            callback.invoke(null, true)
        } catch (e: Exception) {
            println("ColorTFLite: Failed to load model - ${e.message}")
            callback.invoke(e.message, null)
        }
    }

    @ReactMethod
    fun predict(l: Double, a: Double, b: Double, callback: Callback) {
        println("ColorTFLite: Legacy prediction called with pre-scaled inputs")
        runInference(floatArrayOf(l.toFloat(), a.toFloat(), b.toFloat()), null, callback)
    }

    @ReactMethod
    fun predictFromRgb(r: Double, g: Double, b: Double, callback: Callback) {
        val interp = helper.interpreter ?: run {
            println("ColorTFLite: Model not loaded, cannot run CAM16-UCS prediction")
            callback.invoke("model_not_loaded", null)
            return
        }

        val rInt = r.roundToInt().coerceIn(0, 255)
        val gInt = g.roundToInt().coerceIn(0, 255)
        val bInt = b.roundToInt().coerceIn(0, 255)

        println("ColorTFLite: Predicting from RGB -> CAM16-UCS for ($rInt,$gInt,$bInt)")

        val cam = try {
            Cam16Ucs.rgbToCam16Ucs(rInt, gInt, bInt)
        } catch (e: Exception) {
            println("ColorTFLite: CAM16-UCS conversion failed - ${e.message}")
            callback.invoke("cam16_conversion_failed", null)
            return
        }

        if (cam.size < 3 || cam[0].isNaN() || cam[1].isNaN() || cam[2].isNaN()) {
            println("ColorTFLite: Invalid CAM16-UCS output for ($rInt,$gInt,$bInt)")
            callback.invoke("cam16_invalid", null)
            return
        }

        val inputVector = floatArrayOf(
            (cam[0] / 100.0).toFloat(),
            (cam[1] / 50.0).toFloat(),
            (cam[2] / 50.0).toFloat()
        )

        runInference(inputVector, cam, callback, interp)
    }

    @ReactMethod
    fun close(callback: Callback) {
        helper.close()
        callback.invoke(null, true)
    }

    private fun runInference(
        input: FloatArray,
        cam16: DoubleArray?,
        callback: Callback,
        cachedInterpreter: Interpreter? = helper.interpreter
    ) {
        val interp = cachedInterpreter ?: run {
            println("ColorTFLite: Interpreter not available for inference")
            callback.invoke("model_not_loaded", null)
            return
        }

        val outSize = if (labelCount > 0) labelCount else 12
        val output = Array(1) { FloatArray(outSize) }

        println("ColorTFLite: Running inference with input=${input.joinToString()}")
        interp.run(arrayOf(input), output)

        val probs = output[0]
        var maxIdx = 0
        var maxVal = probs[0]
        for (i in 1 until probs.size) {
            if (probs[i] > maxVal) {
                maxVal = probs[i]
                maxIdx = i
            }
        }

        println("ColorTFLite: Prediction result - Index: $maxIdx, Score: $maxVal")
        val result: WritableMap = Arguments.createMap().apply {
            putInt("index", maxIdx)
            putDouble("score", maxVal.toDouble())
            cam16?.let {
                putArray("cam16", toWritableArray(it))
            }
        }

        callback.invoke(null, result)
    }

    private fun toWritableArray(values: DoubleArray): WritableArray {
        val arr = Arguments.createArray()
        values.forEach { arr.pushDouble(it) }
        return arr
    }
}
