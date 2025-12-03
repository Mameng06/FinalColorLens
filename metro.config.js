const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [],
  resolver: {
    blockList: [
      // Ignore build directories in node_modules to prevent Metro watcher errors
      /node_modules\/.*\/android\/build\/.*/,
      /node_modules\/.*\/ios\/build\/.*/,
    ],
  },
  watcher: {
    watchman: {
      ignore_dirs: [
        'node_modules/react-native-webview/android/build',
        'node_modules/**/android/build',
        'node_modules/**/ios/build',
      ],
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
