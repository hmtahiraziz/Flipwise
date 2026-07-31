import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import {CreateDeckHeader} from '../../components/deck/CreateDeckHeader';
import {CreateDeckHero} from '../../components/deck/CreateDeckHero';
import {DeckEditorFields} from '../../components/deck/DeckEditorFields';
import {DeckFormFooter} from '../../components/deck/DeckFormFooter';
import {DeckLivePreviewBadge} from '../../components/deck/DeckLivePreviewBadge';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {createDeckTokens, type DeckAccentColor} from '../../config/createDeckTokens';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {deckSchema, type DeckFormValues} from '../../lib/schemas';
import {useAppUser} from '../../hooks/useAppUser';
import {useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'CreateDeck'>;

export function CreateDeckScreen({navigation, route}: Props) {
  const layout = useLibraryLayout();
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {createDeck} = useDeckMutations();
  const redirectTo = route.params?.redirectTo;
  const initialSource = route.params?.initialSource ?? 'topic';
  const isAiFlow = redirectTo === 'GenerateCards';
  const [accentColor, setAccentColor] = useState<DeckAccentColor>(
    createDeckTokens.accentSwatches[0],
  );

  const {
    handleSubmit,
    watch,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: {title: '', subject: '', description: ''},
  });

  const title = watch('title');
  const subject = watch('subject');
  const description = watch('description') ?? '';

  const tabClearance = layout.tabScrollBottomPadding;
  const contentMaxWidth = Math.min(libraryTokens.contentMaxWidth, layout.width - layout.horizontalPadding * 2);

  const previewLabel = useMemo(() => {
    const trimmed = title.trim();
    if (trimmed) return trimmed;
    const subj = subject.trim();
    if (subj) return subj;
    return 'New Deck';
  }, [title, subject]);

  const headerRight = (
    <Pressable
      onPress={openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        overflow: 'hidden',
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={32}
      />
    </Pressable>
  );

  const onSubmit = handleSubmit(async values => {
    try {
      const deck = await createDeck({
        title: values.title.trim(),
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
      });

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
        right={headerRight}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={layout.insets.top + 64}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: 24,
            maxWidth: contentMaxWidth,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <CreateDeckHero
            subtitle={
              isAiFlow
                ? 'Match title and subject to what you are studying. You will generate cards in this deck next.'
                : 'Give your deck a clear title and subject to keep cards and review organized.'
            }
          />

          <DeckEditorFields
            variant="create"
            title={title}
            subject={subject}
            description={description}
            accentColor={accentColor}
            onAccentColorChange={setAccentColor}
            onTitleChange={value => setValue('title', value, {shouldValidate: true})}
            onSubjectChange={value => setValue('subject', value, {shouldValidate: true})}
            onDescriptionChange={value => setValue('description', value, {shouldValidate: true})}
            titleError={errors.title?.message}
            subjectError={errors.subject?.message}
            descriptionError={errors.description?.message}
          />

          <DeckLivePreviewBadge label={previewLabel} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{paddingBottom: tabClearance}}>
        <DeckFormFooter
          variant="create"
          label={isAiFlow ? 'Create deck & continue' : 'Create deck'}
          saving={isSubmitting}
          onPress={() => void onSubmit()}
        />
      </View>
    </View>
  );
}
