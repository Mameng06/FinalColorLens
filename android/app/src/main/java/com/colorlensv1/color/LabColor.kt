package com.colorlensv1.color

import kotlin.math.*

object LabColor {

    private fun srgbToLinear(c: Double): Double {
        return if (c <= 0.04045) {
            c / 12.92
        } else {
            ((c + 0.055) / 1.055).pow(2.4)
        }
    }

    fun rgbToLab(r: Int, g: Int, b: Int): DoubleArray {
        val rl = srgbToLinear(r / 255.0)
        val gl = srgbToLinear(g / 255.0)
        val bl = srgbToLinear(b / 255.0)

        val x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
        val y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
        val z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

        val xn = 0.95047
        val yn = 1.00000
        val zn = 1.08883

        val fx = f(x / xn)
        val fy = f(y / yn)
        val fz = f(z / zn)

        val l = 116.0 * fy - 16.0
        val a = 500.0 * (fx - fy)
        val bVal = 200.0 * (fy - fz)

        return doubleArrayOf(l, a, bVal)
    }

    private fun f(t: Double): Double {
        val delta = 6.0 / 29.0
        return if (t > delta * delta * delta) {
            t.pow(1.0 / 3.0)
        } else {
            t / (3 * delta * delta) + 4.0 / 29.0
        }
    }

    fun deltaE2000(lab1: DoubleArray, lab2: DoubleArray): Double {
        val L1 = lab1[0]
        val a1 = lab1[1]
        val b1 = lab1[2]
        val L2 = lab2[0]
        val a2 = lab2[1]
        val b2 = lab2[2]

        val avgLp = (L1 + L2) / 2.0
        val c1 = sqrt(a1 * a1 + b1 * b1)
        val c2 = sqrt(a2 * a2 + b2 * b2)
        val avgC = (c1 + c2) / 2.0
        val g = 0.5 * (1 - sqrt((avgC.pow(7.0)) / (avgC.pow(7.0) + 25.0.pow(7.0))))
        val a1p = (1 + g) * a1
        val a2p = (1 + g) * a2
        val c1p = sqrt(a1p * a1p + b1 * b1)
        val c2p = sqrt(a2p * a2p + b2 * b2)
        val avgCp = (c1p + c2p) / 2.0
        val h1p = hp(a1p, b1)
        val h2p = hp(a2p, b2)
        val deltahp = when {
            c1p == 0.0 || c2p == 0.0 -> 0.0
            abs(h2p - h1p) <= 180 -> h2p - h1p
            h2p - h1p > 180 -> h2p - h1p - 360
            h2p - h1p < -180 -> h2p - h1p + 360
            else -> 0.0
        }
        val deltaLp = L2 - L1
        val deltaCp = c2p - c1p
        val deltaHp = 2 * sqrt(c1p * c2p) * sin(Math.toRadians(deltahp / 2.0))

        val avgHp = when {
            c1p == 0.0 || c2p == 0.0 -> h1p + h2p
            abs(h1p - h2p) <= 180 -> (h1p + h2p) / 2.0
            abs(h1p - h2p) > 180 && h1p + h2p < 360 -> (h1p + h2p + 360) / 2.0
            else -> (h1p + h2p - 360) / 2.0
        }

        val t = 1.0 - 0.17 * cos(Math.toRadians(avgHp - 30.0)) +
                0.24 * cos(Math.toRadians(2 * avgHp)) +
                0.32 * cos(Math.toRadians(3 * avgHp + 6)) -
                0.20 * cos(Math.toRadians(4 * avgHp - 63))
        val deltaRo = 30.0 * exp(-((avgHp - 275.0) / 25.0).pow(2.0))
        val rc = 2 * sqrt((avgCp.pow(7.0)) / (avgCp.pow(7.0) + 25.0.pow(7.0)))
        val sl = 1.0 + ((0.015 * (avgLp - 50.0).pow(2.0)) / sqrt(20 + (avgLp - 50.0).pow(2.0)))
        val sc = 1.0 + 0.045 * avgCp
        val sh = 1.0 + 0.015 * avgCp * t
        val rt = -sin(Math.toRadians(2 * deltaRo)) * rc

        return sqrt(
            (deltaLp / sl).pow(2.0) +
            (deltaCp / sc).pow(2.0) +
            (deltaHp / sh).pow(2.0) +
            rt * (deltaCp / sc) * (deltaHp / sh)
        )
    }

    private fun hp(a: Double, b: Double): Double {
        if (a == 0.0 && b == 0.0) return 0.0
        var angle = Math.toDegrees(atan2(b, a))
        if (angle < 0) angle += 360.0
        return angle
    }
}



