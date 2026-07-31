import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {DeckDetailHeader} from '../../components/deck/DeckDetailHeader';
import {DeckEditorFields} from '../../components/deck/DeckEditorFields';
import {DeckFormFooter} from '../../components/deck/DeckFormFooter';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {deckSchema, type DeckFormValues} from '../../lib/schemas';
import {useAppUser} from '../../hooks/useAppUser';
import {useDeck, useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditDeck'>;

export function EditDeckScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const layout = useLibraryLayout();
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: deck, isLoading, error} = useDeck(deckId);
  const {updateDeck} = useDeckMutations();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: {errors, isSubmitting, isDirty},
  } = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: {title: '', subject: '', description: ''},
  });

  const title = watch('title');
  const subject = watch('subject');
  const description = watch('description') ?? '';

  useEffect(() => {
    if (deck) {
      reset({
        title: deck.title,
        subject: deck.subject,
        description: deck.description ?? '',
      });
    }
  }, [deck, reset]);

  const tabClearance = layout.tabScrollBottomPadding;

  const headerRight = (
    <Pressable
      onPress={openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainer,
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={40}
      />
    </Pressable>
  );

  const onSubmit = handleSubmit(async values => {
    try {
      await updateDeck(deckId, {
        title: values.title.trim(),
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      toast.error('Could not update deck', getApiErrorMessage(err));
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: libraryTokens.background}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !deck) {
    return (
      <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
        <DeckDetailHeader
          title="Edit deck"
          titleColor={libraryTokens.ink}
          backIconColor={libraryTokens.ink}
          onBack={() => navigation.goBack()}
        />
        <View style={{padding: layout.horizontalPadding, paddingTop: 24}}>
          <Text style={{fontFamily: fonts.body, fontSize: 16, color: libraryTokens.error}}>
            {getApiErrorMessage(error, 'Deck not found')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <DeckDetailHeader
        title="Edit deck"
        titleColor={libraryTokens.ink}
        backIconColor={libraryTokens.ink}
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
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: libraryTokens.muted,
              marginBottom: 20,
            }}>
            Update title, subject, or description for this deck.
          </Text>

          <DeckEditorFields
            title={title}
            subject={subject}
            description={description}
            onTitleChange={value => setValue('title', value, {shouldDirty: true, shouldValidate: true})}
            onSubjectChange={value => setValue('subject', value, {shouldDirty: true, shouldValidate: true})}
            onDescriptionChange={value =>
              setValue('description', value, {shouldDirty: true, shouldValidate: true})
            }
            titleError={errors.title?.message}
            subjectError={errors.subject?.message}
            descriptionError={errors.description?.message}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{paddingBottom: tabClearance}}>
        <DeckFormFooter
          label="Save changes"
          saving={isSubmitting}
          disabled={!isDirty}
          onPress={() => void onSubmit()}
        />
      </View>
    </View>
  );
}
