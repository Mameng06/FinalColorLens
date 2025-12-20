import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { styles } from './PreviewBox.styles';
import { handleSwatchPress } from './PreviewBoxLogic';

interface SwatchProps {
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  label?: string;
  onPress?: () => void;
}

const Swatch: React.FC<SwatchProps> = ({ color = '#090807', containerStyle, boxStyle, label, onPress }) => {
  const Content = (
    <View style={[styles.colorSwatchContainer, containerStyle]}>
      <View style={[styles.colorSwatch, boxStyle, { backgroundColor: color }]} />
      {label ? <Text style={styles.swatchText}>{label}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => handleSwatchPress(onPress)} activeOpacity={0.8}>
        {Content}
      </TouchableOpacity>
    );
  }
  return Content;
};

export default Swatch;
