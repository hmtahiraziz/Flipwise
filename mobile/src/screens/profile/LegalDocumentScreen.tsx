import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {legalDocuments, type LegalDocumentKey} from '../../config/legal';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import type {ProfileRoutesParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  ProfileRoutesParamList,
  'PrivacyPolicy' | 'TermsOfService' | 'DataHandling'
>;

type LegalDocumentScreenProps = Props & {
  documentKey: LegalDocumentKey;
};

function LegalDocumentContent({documentKey, navigation}: LegalDocumentScreenProps) {
  const insets = useSafeAreaInsets();
  const doc = legalDocuments[documentKey];

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title={doc.title}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 32,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: libraryTokens.muted,
            marginBottom: 16,
          }}>
          Last updated: {doc.lastUpdated}
        </Text>

        {doc.intro ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: libraryTokens.ink,
              marginBottom: 24,
            }}>
            {doc.intro}
          </Text>
        ) : null}

        {doc.sections.map(section => (
          <View key={section.title} style={{marginBottom: 24}}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 18,
                lineHeight: 24,
                color: libraryTokens.ink,
                marginBottom: 8,
              }}>
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={`${section.title}-${index}`}
                style={{
                  fontFamily: fonts.body,
                  fontSize: 15,
                  lineHeight: 22,
                  color: libraryTokens.muted,
                  marginBottom: 12,
                }}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function PrivacyPolicyScreen(
  props: NativeStackScreenProps<ProfileRoutesParamList, 'PrivacyPolicy'>,
) {
  return <LegalDocumentContent {...props} documentKey="privacy" />;
}

export function TermsOfServiceScreen(
  props: NativeStackScreenProps<ProfileRoutesParamList, 'TermsOfService'>,
) {
  return <LegalDocumentContent {...props} documentKey="terms" />;
}

export function DataHandlingScreen(
  props: NativeStackScreenProps<ProfileRoutesParamList, 'DataHandling'>,
) {
  return <LegalDocumentContent {...props} documentKey="data" />;
}
