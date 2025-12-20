export type PickImageOptions = {
  mediaType?: 'photo' | 'mixed' | 'video';
};

export async function pickImageAndReturnUri(opts?: PickImageOptions): Promise<string | null> {
  try {
    let ImagePicker: any = null;
    try { ImagePicker = require('react-native-image-picker'); } catch (_e) { ImagePicker = null; }
    if (!ImagePicker || typeof ImagePicker.launchImageLibrary !== 'function') return null;

    const options = { mediaType: opts?.mediaType || 'photo' } as any;

    const uri: string | null = await new Promise((resolve) => {
      try {
        ImagePicker.launchImageLibrary(options, (response: any) => {
          try {
            if (!response || response.didCancel) { resolve(null); return; }
            const u = (response.assets && response.assets[0] && response.assets[0].uri) || response.uri || null;
            resolve(typeof u === 'string' ? u : null);
          } catch (_e) { resolve(null); }
        });
      } catch (_e) { resolve(null); }
    });

    return uri;
  } catch (_e) {
    return null;
  }
}

