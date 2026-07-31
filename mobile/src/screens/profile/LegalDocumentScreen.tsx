import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {legalDocuments, type LegalDocumentKey} from '../../config/legal';
import {AppHeader} from '../../components/ui/AppHeader';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'PrivacyPolicy' | 'TermsOfService' | 'DataHandling'>;

type LegalDocumentScreenProps = Props & {
  documentKey: LegalDocumentKey;
};

function LegalDocumentContent({documentKey, navigation}: LegalDocumentScreenProps) {
  const insets = useSafeAreaInsets();
  const doc = legalDocuments[documentKey];

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={doc.title} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 32,
        }}>
        <Text className="text-caption text-muted mb-4">
          Last updated: {doc.lastUpdated}
        </Text>

        {doc.intro ? (
          <Text className="text-body text-text leading-6 mb-6">{doc.intro}</Text>
        ) : null}

        {doc.sections.map(section => (
          <View key={section.title} className="mb-6">
            <Text className="text-heading font-display text-text mb-2">
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={`${section.title}-${index}`}
                className="text-body text-muted leading-6 mb-3">
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function PrivacyPolicyScreen(props: NativeStackScreenProps<LibraryStackParamList, 'PrivacyPolicy'>) {
  return <LegalDocumentContent {...props} documentKey="privacy" />;
}

export function TermsOfServiceScreen(props: NativeStackScreenProps<LibraryStackParamList, 'TermsOfService'>) {
  return <LegalDocumentContent {...props} documentKey="terms" />;
}

export function DataHandlingScreen(props: NativeStackScreenProps<LibraryStackParamList, 'DataHandling'>) {
  return <LegalDocumentContent {...props} documentKey="data" />;
}
