import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ICONS } from '../../Images';
import { styles } from './CLSetting.styles';

interface CLSettingProps {
  onBack: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
  voiceMode?: 'family' | 'real' | 'disable';
  
  onToggleColorCodes?: (v:boolean)=>void;
  onNavigateToYT?: ()=>void;
  onNavigateToAbout?: ()=>void;
  onChangeVoiceMode?: (m:'family'|'real'|'disable')=>void;
  showFamily?: boolean;
  showRealName?: boolean;
  onToggleShowFamily?: (v:boolean)=>void;
  onToggleShowRealName?: (v:boolean)=>void;
}
const ToggleButton: React.FC<{ value: boolean; onValueChange: (val: boolean) => void }> = ({ value, onValueChange }) => (
  <TouchableOpacity
    style={[styles.toggleButton, value ? styles.toggleOn : styles.toggleOff]}
    onPress={() => onValueChange(!value)}
    activeOpacity={0.85}
  >
    <Text style={[styles.toggleLabel, value ? styles.toggleLabelOn : styles.toggleLabelOff]}>{value ? 'ON' : 'OFF'}</Text>
    <View style={[styles.toggleCircle, value ? styles.toggleCircleOn : styles.toggleCircleOff]} />
  </TouchableOpacity>
);

const CLSetting: React.FC<CLSettingProps> = ({ onBack, colorCodesVisible=true, voiceMode='family', onToggleColorCodes, onNavigateToYT, onNavigateToAbout, onChangeVoiceMode, showFamily=true, showRealName=true, onToggleShowFamily, onToggleShowRealName }) => {
  const insets = useSafeAreaInsets();
  const [localColorCodesVisible, setLocalColorCodesVisible] = useState<boolean>(colorCodesVisible);
  const [localVoiceMode, setLocalVoiceMode] = useState<'family'|'real'|'disable'>(voiceMode);
  const [localShowFamily, setLocalShowFamily] = useState<boolean>(showFamily);
  const [localShowRealName, setLocalShowRealName] = useState<boolean>(showRealName);
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const saveAndBack = () => {
    onToggleColorCodes && onToggleColorCodes(localColorCodesVisible);
    onToggleShowFamily && onToggleShowFamily(localShowFamily);
    onToggleShowRealName && onToggleShowRealName(localShowRealName);
    onChangeVoiceMode && onChangeVoiceMode(localVoiceMode);
    onBack();
  };
  const dropdownOptions: Array<{ label: string; value: 'family' | 'real' | 'disable' }> = [
    { label: 'Family Color', value: 'family' },
    { label: 'Real Name', value: 'real' },
    { label: 'Disable', value: 'disable' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 0 }]}>
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 12 }]}>
        <TouchableOpacity onPress={saveAndBack} style={styles.backButton} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
          <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.scrollView}>
        <View style={styles.settingCard}>
          <View style={styles.cardTextWrap}>
            <Text style={styles.label}>Hex Display</Text>
            <Text style={styles.note}>e.g., #FF5733</Text>
          </View>
          <ToggleButton
            value={localColorCodesVisible}
            onValueChange={(v) => {
              setLocalColorCodesVisible(v);
              onToggleColorCodes && onToggleColorCodes(v);
            }}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.cardTextWrap}>
            <Text style={styles.label}>Color Family Display</Text>
            <Text style={styles.note}>e.g., Red, Blue, Pink</Text>
          </View>
          <ToggleButton
            value={localShowFamily}
            onValueChange={(v) => {
              setLocalShowFamily(v);
              onToggleShowFamily && onToggleShowFamily(v);
            }}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.cardTextWrap}>
            <Text style={styles.label}>Color Name Display</Text>
            <Text style={styles.note}>e.g., Cerulean, Vermillion</Text>
          </View>
          <ToggleButton
            value={localShowRealName}
            onValueChange={(v) => {
              setLocalShowRealName(v);
              onToggleShowRealName && onToggleShowRealName(v);
            }}
          />
        </View>

        <View style={styles.voiceCard}>
          <Text style={styles.voiceTitle}>Voice Feedback</Text>
          <Text style={styles.voiceNote}>Speak color as:</Text>
          <View style={styles.voiceDropdownWrap}>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setDropdownOpen((v) => !v)}>
              <Text style={styles.dropdownButtonText}>
                {localVoiceMode === 'family' ? 'Family Color' : localVoiceMode === 'real' ? 'Real Name' : 'Disable'}
              </Text>
              <Text style={styles.caret}>{dropdownOpen ? '▲' : '▾'}</Text>
            </TouchableOpacity>
            {dropdownOpen && (
              <View style={styles.dropdownMenu}>
                {dropdownOptions.map((opt, index) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.dropdownItem,
                      index === dropdownOptions.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => {
                      setLocalVoiceMode(opt.value);
                      onChangeVoiceMode && onChangeVoiceMode(opt.value);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        {fabOpen && (
          <View style={styles.fabSubmenu}>
            <TouchableOpacity
              style={styles.fabSubmenuItem}
              onPress={() => {
                setFabOpen(false);
                if (onNavigateToAbout) {
                  onNavigateToAbout();
                } else {
                  Alert.alert(
                    'About ColorLens',
                    'Learn more about ColorLens by visiting our website.'
                  );
                }
              }}
            >
              <Text style={styles.fabSubmenuIcon}>?</Text>
              <Text style={styles.fabSubmenuText} numberOfLines={1} ellipsizeMode="tail">About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabSubmenuItem}
              onPress={() => {
                setFabOpen(false);
                onNavigateToYT && onNavigateToYT();
              }}
            >
              <Image source={ICONS.YTicon} style={[styles.fabSubmenuIcon, styles.fabSubmenuImageSize]} />
              <Text style={styles.fabSubmenuText} numberOfLines={1} ellipsizeMode="tail">
                Video Tutorial
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.fabMain} onPress={() => setFabOpen((v) => !v)} activeOpacity={0.85}>
          <Text style={styles.fabMainIcon}>{fabOpen ? '✕' : '?'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CLSetting;