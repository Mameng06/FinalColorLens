import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './About.styles';
import { ICONS } from '../../Images';

interface AboutScreenProps {
  onBack: () => void;
  onDone?: () => void;
}

const aboutSections = [
  {
    title: 'How It Works',
    items: [
      {
        icon: '📷',
        text: 'Live Scan & Upload: Use your camera in real time or upload from Tap to Detect. Tap any area to identify a color instantly.',
      },
    ],
  },
  {
    title: 'Detailed Insights',
    items: [
      { icon: '🎯', text: 'Get Hex Codes, Color Families, and exact color names for precise identification.' },
      { icon: '🔊', text: 'Accessibility: Hear color names spoken aloud for enhanced usability.' },
    ],
  },
  {
    title: 'Adjusting Your View',
    items: [
      { icon: '🪟', text: 'Precision with Adjust Mode: When using uploaded photos, enter Adjust Mode to fine-tune your selection.' },
      { icon: '🎯', text: 'Target Your Color: Drag the image to position the desired color under the crosshair.' },
      { icon: '✅', text: "Confirm & Detect: Tap 'Done' to lock the image, then detect your color." },
    ],
  },
  {
    title: 'Your Privacy Matters',
    items: [
      { icon: '🔒', text: 'Local Processing: All color sampling is done directly on-device.' },
      { icon: '🚫', text: 'No Server Uploads: Your images are never uploaded to any server by default.' },
    ],
  },
];

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, onDone }) => {
  const insets = useSafeAreaInsets();

  const handleDone = () => {
    if (onDone) {
      onDone();
      return;
    }
    onBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007FFF" />
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About ColorLens</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 0) + 140 }]}>
        <View style={styles.heroCard}>
          <Image source={require('../../img/CLogo.png')} style={styles.heroLogo} />
          <Text style={styles.heroTitle}>ColorLens</Text>
          <Text style={styles.heroSubtitle}>Your Color Assistant</Text>
        </View>

        {aboutSections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, index) => (
              <View key={`${section.title}-${index}`} style={styles.sectionRow}>
                <Text style={styles.sectionIcon}>{item.icon}</Text>
                <Text style={styles.sectionText}>{item.text}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>App Version: 1.0.0</Text>
          <Text style={styles.footerText}>Copyright © 2025 ColorLens</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.primaryButton, { bottom: (insets.bottom || 0) + 16 }]} onPress={handleDone} activeOpacity={0.9}>
        <Text style={styles.primaryButtonText}>Got It!  ✓</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AboutScreen;



