import {Text, View} from 'react-native';
import {FlipwiseWordmark} from '../../components/brand/FlipwiseWordmark';

export function ConfigErrorScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <FlipwiseWordmark variant="light" iconSize={44} />
      <Text className="text-heading font-display text-text mt-8 mb-2 text-center">
        Configuration needed
      </Text>
      <Text className="text-body text-muted text-center leading-6">
        Set CLERK_PUBLISHABLE_KEY in mobile/.env (wrap the value in quotes if it
        ends with $), then restart Metro with --reset-cache.
      </Text>
    </View>
  );
}
