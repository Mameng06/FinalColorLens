import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { styles } from './AdjustBtn.styles';
import { getAdjustLabel, shouldShowHelp } from './AdjustBtnLogic';
import { ICONS } from '../../../Images';

type AdjustBtnProps = {
  visible?: boolean;
  adjusting: boolean;
  onToggle: () => void;
};

const AdjustBtn: React.FC<AdjustBtnProps> = ({ visible = true, adjusting, onToggle }) => {
  if (!visible) return null;
  const label = getAdjustLabel(adjusting);
  const showHelp = shouldShowHelp(adjusting);
  return (
    <View style={styles.adjustArea} pointerEvents="box-none">
      <TouchableOpacity style={styles.adjustButton} onPress={onToggle} activeOpacity={0.85}>
        <View style={styles.adjustButtonContent}>
          <Image source={ICONS.HANDicon} style={styles.adjustIcon} />
          <Text style={styles.adjustText}>{label}</Text>
        </View>
      </TouchableOpacity>
      {showHelp && (
        <View style={styles.adjustHelp}>
          <Text style={styles.adjustHelpText}>
            Drag the image to position it so the area you want to sample is visible under the crosshair. Tap done when finished.
          </Text>
        </View>
      )}
    </View>
  );
};

export default AdjustBtn;

