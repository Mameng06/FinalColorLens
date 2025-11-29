import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  PixelRatio,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './WelcomeScreen.styles';

interface WelcomeScreenProps {
  onNext: () => void;
}
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { width } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  const scale = useMemo(() => {
    const s = width / 375;
    return Math.max(0.85, Math.min(s, 1.25));
  }, [width]);

  const scaled = useMemo(() => {
    const rf = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scale));
    return {
      titleSize: rf(36),
      titleMargin: rf(28),
      descSize: rf(16),
      descLineHeight: rf(24),
      buttonPaddingVertical: rf(14),
      buttonPaddingHorizontal: rf(28),
    };
  }, [scale]);

  const featureList = [
    {
      title: 'Real-Time Identification',
      description: 'Use your camera or upload an image to detect colors on the spot.',
      symbol: '📷',
    },
    {
      title: 'Speak and See',
      description: 'Hear the color name aloud and view the HEX code instantly.',
      symbol: '🔊',
    },
    {
      title: 'Color Families',
      description: 'Discover related shades and never lose context.',
      symbol: '🎨',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070D0D" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Image source={require('../../img/CLogo.png')} style={styles.heroLogo} />
          </View>
          <Text style={styles.heroTitle}>ColorLens</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to ColorLens. Your AI assistant for instant color recognition and voice feedback.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={[styles.sectionTitle, { fontSize: scaled.titleSize * 0.65 }]}>What it Does</Text>
          {featureList.map((item) => (
            <View key={item.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureSymbol}>{item.symbol}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(24, insets.bottom) }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              paddingVertical: scaled.buttonPaddingVertical,
              paddingHorizontal: scaled.buttonPaddingHorizontal,
              borderRadius: Math.max(24, Math.round(28 * scale)),
            },
          ]}
          onPress={onNext}
          activeOpacity={0.9}
        >
          <Text style={styles.nextButtonText}>Start Exploring</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;


