package com.colorlensv1.tflite

import com.colorlensv1.color.LabColor
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
            val startTime = System.currentTimeMillis()
            android.util.Log.d("ColorTFLite", "Starting to load color_model.tflite...")
            println("ColorTFLite: Starting to load color_model.tflite...")
            
            helper.loadModel()
            labelCount = helper.getLabelCount()
            
            val loadTime = System.currentTimeMillis() - startTime
            val message = "ColorTFLite: Model loaded successfully! Label count: $labelCount, Load time: ${loadTime}ms"
            android.util.Log.d("ColorTFLite", message)
            println(message)
            
            callback.invoke(null, true)
        } catch (e: Exception) {
            val errorMsg = "ColorTFLite: Failed to load model - ${e.message}"
            android.util.Log.e("ColorTFLite", errorMsg, e)
            println(errorMsg)
            e.printStackTrace()
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
            println("ColorTFLite: Model not loaded, cannot run Lab prediction")
            callback.invoke("model_not_loaded", null)
            return
        }

        val rInt = r.roundToInt().coerceIn(0, 255)
        val gInt = g.roundToInt().coerceIn(0, 255)
        val bInt = b.roundToInt().coerceIn(0, 255)

        val lab = try {
            LabColor.rgbToLab(rInt, gInt, bInt)
        } catch (e: Exception) {
            println("ColorTFLite: Lab conversion failed - ${e.message}")
            callback.invoke("lab_conversion_failed", null)
            return
        }

        if (lab.size < 3 || lab[0].isNaN() || lab[1].isNaN() || lab[2].isNaN()) {
            println("ColorTFLite: Invalid Lab output for ($rInt,$gInt,$bInt)")
            callback.invoke("lab_invalid", null)
            return
        }

        val inputVector = floatArrayOf(
            (lab[0] / 100.0).toFloat(),
            (lab[1] / 128.0).toFloat(),
            (lab[2] / 128.0).toFloat()
        )

        runInference(inputVector, lab, callback, interp)
    }

    @ReactMethod
    fun close(callback: Callback) {
        helper.close()
        callback.invoke(null, true)
    }

    private fun runInference(
        input: FloatArray,
        lab: DoubleArray?,
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
        val result: WritableMap = Arguments.createMap().apply {
            putInt("index", maxIdx)
            putDouble("score", maxVal.toDouble())
            lab?.let {
                putArray("lab", toWritableArray(it))
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
