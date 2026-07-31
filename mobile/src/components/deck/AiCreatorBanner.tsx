import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Text, useWindowDimensions, View} from 'react-native';
import {colors} from '../../config/theme';
import {Button} from '../ui/Button';

type AiCreatorBannerProps = {
  onPress: () => void;
};

export function AiCreatorBanner({onPress}: AiCreatorBannerProps) {
  const {width} = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View className="bg-surface-container-low rounded-huge p-6 border border-dashed border-border">
      <View className={isWide ? 'flex-row items-center gap-6' : 'gap-6'}>
        <View className="w-16 h-16 bg-primary-container rounded-full items-center justify-center shrink-0 self-center">
          <MaterialIcons name="auto-awesome" size={32} color={colors.onPrimaryContainer} />
        </View>

        <View className={`flex-1 ${isWide ? '' : 'items-center'}`}>
          <Text
            className={`text-heading font-display-md text-text mb-1 ${isWide ? '' : 'text-center'}`}>
            Generate from Syllabus
          </Text>
          <Text
            className={`text-body text-muted leading-6 ${isWide ? '' : 'text-center'}`}>
            Upload a document and Flipwise AI will create 50 cards automatically.
          </Text>
        </View>

        <Button
          label="Try AI Creator"
          variant="primary"
          className={isWide ? 'shrink-0' : 'self-stretch'}
          onPress={onPress}
        />
      </View>
    </View>
  );
}
