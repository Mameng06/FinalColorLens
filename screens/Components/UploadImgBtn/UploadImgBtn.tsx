import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { styles } from './UploadImgBtn.styles';
import { pickImageAndReturnUri } from './UploadImgBtnLogic';
import { ICONS } from '../../../Images';

type UploadImgBtnProps = {
  disabled?: boolean;
  label?: string;
  onPicked: (uri: string) => void;
};

const UploadImgBtn: React.FC<UploadImgBtnProps> = ({ disabled = false, label = 'Upload Image', onPicked }) => {
  const onPress = async () => {
    if (disabled) return;
    const uri = await pickImageAndReturnUri({ mediaType: 'photo' });
    if (uri) onPicked(uri);
  };

  return (
    <TouchableOpacity
      style={[styles.uploadButton, disabled && { opacity: 0.45 }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.uploadButtonContent}>
        <Image source={ICONS.UploadIcon} style={styles.uploadIcon} />
        <Text style={styles.uploadButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default UploadImgBtn;

