import { NativeModules } from 'react-native'

const { ColorMatcherNative } = NativeModules

export type MatchResult = {
  detected_color_rgb: number[];
  detected_color_hex: string;
  closest_match: {
    name: string;
    hex: string;
    family?: string;
    deltaE: number;
    confidence?: number;
  };
  alternatives: Array<{
    name: string;
    hex: string;
    family?: string;
    deltaE: number;
    confidence?: number;
  }>;
}

let initialized = false

export default {
  async initialize(): Promise<boolean> {
    if (initialized) return true
    try {
      const result = await new Promise<boolean>((resolve, reject) => {
        ColorMatcherNative.initialize((err: any, ok: boolean) => {
          if (err) return reject(err)
          resolve(!!ok)
        })
      })
      initialized = result
      console.log("ColorMatcherNative: Initialized:", initialized)
      return initialized
    } catch (e) {
      console.log("ColorMatcherNative: Failed to initialize:", e)
      return false
    }
  },

  async findClosestColor(rgb: number[], topN = 3): Promise<MatchResult> {
    if (!initialized) {
      const initResult = await this.initialize()
      if (!initResult) {
        throw new Error("ColorMatcherNative not initialized")
      }
    }

    if (!Array.isArray(rgb) || rgb.length < 3) {
      throw new Error('rgb must be an array of three numbers [r,g,b]')
    }

    return new Promise((resolve, reject) => {
      ColorMatcherNative.findClosestColor(
        Math.round(rgb[0]),
        Math.round(rgb[1]),
        Math.round(rgb[2]),
        topN,
        (err: any, result: any) => {
          if (err) {
            console.log("ColorMatcherNative: Error:", err)
            return reject(err)
          }
          resolve(result as MatchResult)
        }
      )
    })
  },

  async isInitialized(): Promise<boolean> {
    return new Promise((resolve) => {
      ColorMatcherNative.isInitialized((_err: any, ok: boolean) => {
        resolve(!!ok)
      })
    })
  },
}





