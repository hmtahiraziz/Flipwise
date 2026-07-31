import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Text, useWindowDimensions, View} from 'react-native';
import {colors} from '../../config/theme';
import {SilhouetteCard} from '../ui/SilhouetteCard';

type StudyTipCardProps = {
  title?: string;
  body: string;
};

export function StudyTipCard({
  title = 'Study Tip',
  body,
}: StudyTipCardProps) {
  const {width} = useWindowDimensions();
  const stack = width < 480;

  return (
    <SilhouetteCard className="mt-12 mb-8">
      <View
        className={`bg-card border border-border rounded-huge p-5 gap-4 ${
          stack ? 'items-center' : 'flex-row items-start'
        }`}>
        <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center shrink-0">
          <MaterialIcons name="lightbulb" size={22} color={colors.onPrimaryContainer} />
        </View>
        <View className={stack ? 'items-center' : 'flex-1'}>
          <Text
            className={`text-body-md font-semibold text-text mb-1 ${stack ? 'text-center' : ''}`}>
            {title}
          </Text>
          <Text className={`text-body text-muted leading-6 ${stack ? 'text-center' : ''}`}>
            {body}
          </Text>
        </View>
      </View>
    </SilhouetteCard>
  );
}
