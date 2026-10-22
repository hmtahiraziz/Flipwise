import {Text, View} from 'react-native';
import {CardweaveWordmark} from '../../components/brand/CardweaveWordmark';

type Props = {
  title?: string;
  message?: string;
};

export function ConfigErrorScreen({
  title = 'Configuration needed',
  message = 'Set CLERK_PUBLISHABLE_KEY in mobile/.env (wrap the value in quotes if it ends with $), then restart Metro with --reset-cache.',
}: Props) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <CardweaveWordmark variant="light" iconSize={44} />
      <Text className="text-heading font-display text-text mt-8 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-body text-muted text-center leading-6">{message}</Text>
    </View>
  );
}
