import {Text, View} from 'react-native';
import {FlipwiseLogo} from '../brand/FlipwiseLogo';
import {fonts} from '../../config/theme';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';

type AuthBrandHeaderProps = {
  subtitle: string;
  headline?: string;
  showTagline?: boolean;
};

export function AuthBrandHeader({
  subtitle,
  headline,
  showTagline = true,
}: AuthBrandHeaderProps) {
  const layout = useAuthLayout();
  const displayHeadline =
    headline ??
    (showTagline
      ? layout.isVeryCompactHeight
        ? 'Remember more, forget less.'
        : 'Remember more,\nforget less.'
      : undefined);

  return (
    <View style={{alignItems: 'center', marginBottom: layout.sectionGap, width: '100%'}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <FlipwiseLogo
          size={layout.logoSize}
          frontColor={authTheme.primaryContainer}
          backColor={authTheme.onSurface}
        />
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: layout.titleSize,
            lineHeight: layout.titleSize + 8,
            letterSpacing: layout.titleSize * -0.02,
            color: authTheme.onSurface,
          }}>
          Flipwise AI
        </Text>
      </View>

      <View
        style={{
          width: Math.round(layout.titleSize * 1.75),
          height: 3,
          borderRadius: 2,
          backgroundColor: authTheme.primaryContainer,
          marginTop: 10,
          marginBottom: layout.isCompactHeight ? 14 : 20,
        }}
      />

      {displayHeadline ? (
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: layout.headlineSize,
            lineHeight: layout.headlineSize + 8,
            letterSpacing: -0.4,
            color: authTheme.onSurface,
            textAlign: 'center',
            paddingHorizontal: 8,
          }}>
          {displayHeadline}
        </Text>
      ) : null}

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: layout.bodySize,
          lineHeight: Math.round(layout.bodySize * 1.5),
          color: authTheme.muted,
          textAlign: 'center',
          marginTop: displayHeadline ? 10 : 0,
          maxWidth: layout.contentMaxWidth - 8,
          paddingHorizontal: 4,
        }}>
        {subtitle}
      </Text>
    </View>
  );
}
