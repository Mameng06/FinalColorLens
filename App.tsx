/**
 * @format
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen/WelcomeScreen';
import YTembedScreen from './screens/YTembedScreen/YTembedScreen';
import ColorDetector from './screens/ColorDetector/ColorDetector';
import CLSetting from './screens/CLSetting/CLSetting';
import AboutScreen from './screens/AboutScreen/About';
import { initializeColorDetection } from './services/ColorDetectorInference';

const App: React.FC = () => {
  // Initialize color detection early (non-blocking)
  React.useEffect(() => {
    initializeColorDetection().catch(() => {
      // Silently fail - will retry on first use
    });
  }, []);

  const [currentScreen, setCurrentScreen] = useState<'splash' | 'welcome' | 'youtube' | 'colorDetector' | 'settings' | 'about'>('splash');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [colorCodesVisible, setColorCodesVisible] = useState(true);
  const [showFamily, setShowFamily] = useState(true);
  const [showRealName, setShowRealName] = useState(true);
  const [voiceMode, setVoiceMode] = useState<'family' | 'real' | 'disable'>('family');

  const handleSplashFinish = () => {
    setCurrentScreen('welcome');
  };
  const handleWelcomeNext = () => {
    setCurrentScreen('colorDetector');
  };
  const handleNavigateToYT = () => {
    setCurrentScreen('youtube');
  };

  const handleBackFromYT = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromAbout = () => {
    setCurrentScreen('settings');
  };
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}
        {currentScreen === 'welcome' && (
          <WelcomeScreen onNext={handleWelcomeNext} />
        )}
        {currentScreen === 'colorDetector' && (
          <ColorDetector
            onBack={() => setCurrentScreen('welcome')}
            openSettings={() => setCurrentScreen('settings')}
            voiceEnabled={voiceEnabled}
            colorCodesVisible={colorCodesVisible}
            voiceMode={voiceMode}
            showFamily={showFamily}
            showRealName={showRealName}
          />
        )}
        {currentScreen === 'settings' && (
          <CLSetting
            onBack={() => setCurrentScreen('colorDetector')}
            voiceEnabled={voiceEnabled}
            colorCodesVisible={colorCodesVisible}
            voiceMode={voiceMode}
            showFamily={showFamily}
            showRealName={showRealName}
            onToggleColorCodes={(v: boolean) => setColorCodesVisible(v)}
            onToggleShowFamily={(v: boolean) => setShowFamily(v)}
            onToggleShowRealName={(v: boolean) => setShowRealName(v)}
            onNavigateToYT={handleNavigateToYT}
            onNavigateToAbout={() => setCurrentScreen('about')}
            onChangeVoiceMode={(m:'family'|'real'|'disable')=>setVoiceMode(m)}
          />
        )}
        {currentScreen === 'youtube' && (
          <YTembedScreen onBack={handleBackFromYT} />
        )}
        {currentScreen === 'about' && (
          <AboutScreen onBack={handleBackFromAbout} onDone={handleBackFromAbout} />
        )}
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
