import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Platform, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CreateDeckHeader} from '../../components/deck/CreateDeckHeader';
import {CreateDeckHero} from '../../components/deck/CreateDeckHero';
import {DeckEditorFields} from '../../components/deck/DeckEditorFields';
import {DeckFormFooter} from '../../components/deck/DeckFormFooter';
import {DeckLivePreviewBadge} from '../../components/deck/DeckLivePreviewBadge';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {toast} from '../../components/ui/Toast';
import {keyboardScrollProps} from '../../components/ui/KeyboardSafeView';
import {createDeckTokens, type DeckAccentColor} from '../../config/createDeckTokens';
import {brandColors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {deckSchema, type DeckFormValues} from '../../lib/schemas';
import {useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'CreateDeck'>;

export function CreateDeckScreen({navigation, route}: Props) {
  const layout = useLibraryLayout();
  const insets = useSafeAreaInsets();
  const {createDeck} = useDeckMutations();
  const redirectTo = route.params?.redirectTo;
  const initialSource = route.params?.initialSource ?? 'topic';
  const isAiFlow = redirectTo === 'GenerateCards';
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const [accentColor, setAccentColor] = useState<DeckAccentColor>(
    createDeckTokens.accentSwatches[0],
  );

  const {
    handleSubmit,
    watch,
    setValue,
    formState: {errors, isSubmitting, isValid},
  } = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    mode: 'onChange',
    defaultValues: {title: '', subject: '', description: ''},
  });

  const title = watch('title');
  const subject = watch('subject');
  const description = watch('description') ?? '';

  const contentMaxWidth = Math.min(
    libraryTokens.contentMaxWidth,
    layout.width - layout.horizontalPadding * 2,
  );

  const canSubmit = useMemo(
    () => title.trim().length > 0 && subject.trim().length > 0 && isValid,
    [title, subject, isValid],
  );

  const onSubmit = handleSubmit(async values => {
    try {
      const deck = await createDeck({
        title: values.title.trim(),
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
      });

      toast.success(
        isAiFlow ? 'Deck ready' : 'Deck created',
        isAiFlow ? 'Generating cards next…' : undefined,
      );

      if (redirectTo === 'GenerateCards') {
        navigation.replace('GenerateCards', {
          deckId: deck.id,
          initialSource,
        });
        return;
      }

      navigation.replace('DeckDetail', {deckId: deck.id});
    } catch (error) {
      toast.error('Could not create deck', getApiErrorMessage(error));
    }
  });

  return (
    <View className="flex-1" style={{backgroundColor: createDeckTokens.background}}>
      <CreateDeckHeader
        title="New deck"
        onBack={() => navigation.goBack()}
        right={<HeaderProfileButton size={30} />}
      />

      <View className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          bottomOffset={24}
          {...keyboardScrollProps}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 20,
            paddingBottom: 28,
            maxWidth: contentMaxWidth,
            width: '100%',
            alignSelf: 'center',
          }}
          showsVerticalScrollIndicator={false}>
          <CreateDeckHero
            title={isAiFlow ? 'Name your AI deck' : 'Create a deck'}
            aiFlow={isAiFlow}
            subtitle={
              isAiFlow
                ? 'Set a clear title and subject first — you’ll generate flashcards in the next step.'
                : 'Add a title and subject so reviews and library stay organized.'
            }
          />

          <DeckEditorFields
            variant="create"
            title={title}
            subject={subject}
            description={description}
            accentColor={accentColor}
            onAccentColorChange={setAccentColor}
            autoFocusTitle
            onTitleChange={value =>
              setValue('title', value, {shouldValidate: true, shouldDirty: true})
            }
            onSubjectChange={value =>
              setValue('subject', value, {shouldValidate: true, shouldDirty: true})
            }
            onDescriptionChange={value =>
              setValue('description', value, {shouldValidate: true, shouldDirty: true})
            }
            titleError={errors.title?.message}
            subjectError={errors.subject?.message}
            descriptionError={errors.description?.message}
          />

          <DeckLivePreviewBadge
            title={title}
            subject={subject}
            accentColor={accentColor}
          />
        </KeyboardAwareScrollView>
      </View>

      <View style={{paddingBottom: safeBottom, backgroundColor: brandColors.surface}}>
        <DeckFormFooter
          label={isAiFlow ? 'Continue to generate' : 'Create deck'}
          saving={isSubmitting}
          disabled={!canSubmit}
          onCancel={() => navigation.goBack()}
          onPress={() => void onSubmit()}
          showSaveIcon={canSubmit && !isAiFlow}
        />
      </View>
    </View>
  );
}
