import { NativeModules } from 'react-native'

const { ColorTFLite } = NativeModules

export type PredictResult = { index: number; score: number; lab?: number[] }

export default {
  loadModel(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      ColorTFLite.loadModel((err: any, ok: boolean) => {
        if (err) return reject(err)
        resolve(!!ok)
      })
    })
  },

  predictLab(l: number, a: number, b: number): Promise<PredictResult> {
    return new Promise((resolve, reject) => {
      ColorTFLite.predict(l, a, b, (err: any, res: any) => {
        if (err) return reject(err)
        resolve({ index: res.index, score: res.score, lab: res.lab })
      })
    })
  },

  predictFromRgb(r: number, g: number, b: number): Promise<PredictResult> {
    return new Promise((resolve, reject) => {
      ColorTFLite.predictFromRgb(r, g, b, (err: any, res: any) => {
        if (err) return reject(err)
        resolve({ index: res.index, score: res.score, lab: res.lab })
      })
    })
  },

  close(): Promise<boolean> {
    return new Promise((resolve) => {
      ColorTFLite.close((_err: any, ok: boolean) => resolve(!!ok))
    })
  },
}
