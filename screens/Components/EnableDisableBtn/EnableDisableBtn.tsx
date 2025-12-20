import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './EnableDisableBtn.styles';
import { getToggleIcon, getToggleLabel } from './EnableDisableBtnLogic';

type EnableDisableBtnProps = {
  visible?: boolean;
  enabled: boolean;
  onToggle: () => void;
};

const EnableDisableBtn: React.FC<EnableDisableBtnProps> = ({ visible = true, enabled, onToggle }) => {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={[
        styles.whiteBalanceToggle,
        enabled ? styles.whiteBalanceToggleActive : styles.whiteBalanceToggleInactive,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={styles.whiteBalanceToggleIcon}>{getToggleIcon(enabled)}</Text>
      <Text style={styles.whiteBalanceToggleText}>{getToggleLabel(enabled)}</Text>
    </TouchableOpacity>
  );
};

export default EnableDisableBtn;

