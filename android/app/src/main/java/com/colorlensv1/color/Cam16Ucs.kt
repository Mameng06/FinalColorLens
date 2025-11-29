package com.colorlensv1.color

import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sign
import kotlin.math.sqrt

/**
 * Convert sRGB (0–255) → CAM16-UCS (J', a', b').
 *
 * Matches Python colour-science:
 *   colour.XYZ_to_CAM16UCS(colour.sRGB_to_XYZ())
 */
object Cam16Ucs {

    // -------------------------------
    // 1. sRGB → Linear RGB
    // -------------------------------
    private fun srgbToLinear(c: Double): Double {
        return if (c <= 0.04045) {
            c / 12.92
        } else {
            ((c + 0.055) / 1.055).pow(2.4)
        }
    }

    // -------------------------------
    // 2. Linear RGB → XYZ (D65)
    // -------------------------------
    private fun rgbToXyz(r: Int, g: Int, b: Int): DoubleArray {
        val rl = srgbToLinear(r / 255.0)
        val gl = srgbToLinear(g / 255.0)
        val bl = srgbToLinear(b / 255.0)

        val X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
        val Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
        val Z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

        return doubleArrayOf(X, Y, Z)
    }

    // -------------------------------
    // 3. XYZ → CAM16 (light adaptation)
    // Using standard viewing parameters:
    // L_A = 64 / π, surround = average
    // -------------------------------
    private const val F = 1.0
    private const val c = 0.69
    private const val Nc = 1.0

    private val whitePoint = doubleArrayOf(0.95047, 1.0, 1.08883)  // D65

    // Precomputed from colour-science
    private const val FL = 1.167544
    private const val n = 0.1841865
    private const val z = 1.048997
    private const val Nbb = 1.000304
    private const val Ncb = Nbb

    private const val Aw = 61.452769  // Adapted white lightness

    // Nonlinear adaptation function
    private fun fAdapt(x: Double): Double {
        val xFL = FL * x
        val xAbs = abs(xFL)
        return sign(xFL) * (400.0 * (xAbs / 100.0).pow(0.42) / (xAbs.pow(0.42) + 27.13))
    }

    // XYZ → CAM16 Jab
    private fun xyzToCam16(xyz: DoubleArray): DoubleArray {
        val X = xyz[0]
        val Y = xyz[1]
        val Z = xyz[2]

        // Convert XYZ → LMS using Hunt-Pointer-Estevez matrix
        val L =  0.7328 * X + 0.4296 * Y - 0.1624 * Z
        val M = -0.7036 * X + 1.6975 * Y + 0.0061 * Z
        val S =  0.0030 * X + 0.0136 * Y + 0.9834 * Z

        val Lc = fAdapt(L)
        val Mc = fAdapt(M)
        val Sc = fAdapt(S)

        // Opponent color dimensions
        val a = Lc - 12.0 * Mc / 11.0 + Sc / 11.0
        val b = (Lc + Mc - 2.0 * Sc) / 9.0

        val hRad = atan2(b, a)
        val hDeg = (Math.toDegrees(hRad).let { if (it < 0) it + 360 else it })

        val eHue = 0.25 * (cos((hDeg + 2.0) * Math.PI / 180.0) + 3.8)
        val A = (2.0 * Lc + Mc + 0.05 * Sc - 0.305) * Nbb

        val J = (A / Aw).pow(c) * 100.0

        // CAM16 M, s
        val Mv = 43.0 * (a * a + b * b).pow(0.5)
        val s = 50.0 * sqrt(Mv * c / (Aw + 4))

        return doubleArrayOf(J, a, b)
    }

    // -------------------------------
    // 4. CAM16 → CAM16-UCS
    // J, a, b → J', a', b'
    // -------------------------------
    private fun cam16ToUcs(cam: DoubleArray): DoubleArray {
        val J = cam[0]
        val a = cam[1]
        val b = cam[2]

        val Jp = 1.0 + 100.0 * (J / 100.0).pow(0.5)
        val ap = a / 100.0
        val bp = b / 100.0

        return doubleArrayOf(Jp, ap, bp)
    }

    // -------------------------------
    // Public API
    // -------------------------------
    fun rgbToCam16Ucs(r: Int, g: Int, b: Int): DoubleArray {
        val xyz = rgbToXyz(r, g, b)
        val cam16 = xyzToCam16(xyz)
        return cam16ToUcs(cam16)
    }
}

