import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import { ICONS } from '../../Images';
import { styles } from './YTembedScreen.styles';

let useNavigationHook: any = null;
try {
  useNavigationHook = require('@react-navigation/native').useNavigation;
} catch (e) {
  useNavigationHook = () => null;
}

interface YTembedScreenProps {
  onBack: () => void;
}

const YTembedScreen: React.FC<YTembedScreenProps> = ({ onBack }) => {
  const navigation = useNavigationHook();
  const insets = useSafeAreaInsets();
  const youtubeVideoId = 'm5tB355jTqc';
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
  const youtubeAppUrl = `vnd.youtube://${youtubeVideoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/sddefault.jpg`;

  const [playing, setPlaying] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const playerRef = useRef(null);

  const handleBackToSettings = () => {
    try {
      if (navigation && navigation.navigate) {
        navigation.navigate('CLSetting');
        return;
      }
    } catch (e) {}
    if (onBack) onBack();
  };

  const handlePlayVideo = () => {
    setPlaying(true);
    setPlayerError(false);
  };

  const openExternal = () => {
    Linking.canOpenURL(youtubeAppUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(youtubeAppUrl).catch(() =>
            Linking.openURL(youtubeWatchUrl)
          );
        } else {
          return Linking.openURL(youtubeWatchUrl);
        }
      })
      .catch(() => Linking.openURL(youtubeWatchUrl));
  };

  const handlePlayerError = () => {
    setPlayerError(true);
    setPlaying(false);
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007FFF" />

      <View style={[styles.header, { paddingTop: (insets.top || 0) + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSettings}
            activeOpacity={0.7}
            hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
          >
            <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Video Tutorial</Text>
      </View>

      <View style={styles.videoContainer}>
        {playing ? (
          <YoutubeIframe
            ref={playerRef}
            height={300}
            play={playing}
            videoId={youtubeVideoId}
            onReady={() => {
              setPlayerError(false);
            }}
            onError={handlePlayerError}
            onChangeState={() => {}}
            webViewProps={{
              allowsFullscreenVideo: true,
              mediaPlaybackRequiresUserAction: false,
            }}
          />
        ) : (
          <TouchableOpacity
            style={styles.videoThumbnailContainer}
            onPress={handlePlayVideo}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        {playerError && (
          <View style={styles.openExternalContainer}>
            <TouchableOpacity style={styles.openExternalButton} onPress={openExternal}>
              <Text style={styles.openExternalText}>Open video in YouTube</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ColorLens Tutorial</Text>
        <Text style={styles.infoDescription}>
          Watch this short guide to learn how to detect colors with ColorLens, interpret family and real name results, and customize the app using the Settings screen. The video demonstrates live detection, freezing and sampling, and how to enable or disable voice prompts.
        </Text>
        <TouchableOpacity
          style={styles.watchOnYouTubeButton}
          onPress={handlePlayVideo}
        >
          <Text style={styles.watchOnYouTubeText}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default YTembedScreen;
