import React from 'react';
import { TouchableOpacity, Text, ViewStyle, StyleProp } from 'react-native';
import { styles } from './FreezeBtn.styles';
import { handleFreezeToggle } from './FreezeBtnLogic';

interface FreezeBtnProps {
  freeze: boolean;
  onToggle: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const FreezeBtn: React.FC<FreezeBtnProps> = ({ freeze, onToggle, disabled = false, style }) => {
  return (
    <TouchableOpacity
      style={[freeze ? styles.unfreezeButton : styles.freezeButton, disabled && { opacity: 0.45 }, style]}
      onPress={() => handleFreezeToggle(onToggle)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={styles.freezeButtonText}>{freeze ? 'Unfreeze' : 'Freeze Frame'}</Text>
    </TouchableOpacity>
  );
};

export default FreezeBtn;
