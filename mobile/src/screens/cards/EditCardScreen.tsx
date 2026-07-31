import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useLayoutEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {CardEditorFields} from '../../components/card/CardEditorFields';
import {EditCardFooter} from '../../components/card/EditCardFooter';
import {GenerateReviewHeader} from '../../components/generate/GenerateReviewHeader';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useCardMutations, useCards} from '../../hooks/useCards';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {getApiErrorMessage} from '../../lib/errors';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {cardSchema, type CardFormValues} from '../../lib/schemas';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditCard'>;

export function EditCardScreen({navigation, route}: Props) {
  const {deckId, cardId} = route.params;
  const isEditing = Boolean(cardId);
  const layout = useLibraryLayout();
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: cards, isLoading} = useCards(deckId);
  const {createCard, updateCard, deleteCard} = useCardMutations(deckId);
  const [deleting, setDeleting] = useState(false);

  const existing = cards?.find(card => card.id === cardId);
  const compact = layout.isNarrow;
  const tabClearance = layout.tabScrollBottomPadding;
  const screenTitle = isEditing ? 'Edit card' : 'New card';

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {question: '', answer: ''},
  });

  const question = watch('question');
  const answer = watch('answer');

  useLayoutEffect(() => {
    if (existing) {
      reset({question: existing.question, answer: existing.answer});
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEditing && cardId) {
        await updateCard(cardId, {
          question: values.question.trim(),
          answer: values.answer.trim(),
        });
      } else {
        await createCard({
          question: values.question.trim(),
          answer: values.answer.trim(),
        });
      }
      navigation.goBack();
    } catch (error) {
      toast.error('Could not save card', getApiErrorMessage(error));
    }
  });

  const confirmDelete = () => {
    if (!cardId) return;

    Alert.alert('Delete card', 'This card will be permanently removed.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void handleDelete(),
      },
    ]);
  };

  const handleDelete = async () => {
    if (!cardId) return;

    setDeleting(true);
    try {
      await deleteCard(cardId);
      navigation.goBack();
    } catch (error) {
      toast.error('Could not delete card', getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

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

  if (isEditing && isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{backgroundColor: libraryTokens.background}}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  if (isEditing && !isLoading && !existing) {
    return (
      <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
        <GenerateReviewHeader
          onBack={() => navigation.goBack()}
          title="Card not found"
          right={headerRight}
        />
        <View style={{paddingHorizontal: layout.horizontalPadding, paddingTop: 24}}>
          <Text
            style={{
              fontFamily: fonts.body,
              color: libraryTokens.error,
              marginBottom: 16,
            }}>
            This card may have been deleted.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: libraryTokens.surface,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              borderRadius: 12,
              alignItems: 'center',
            }}>
            <Text style={{fontFamily: fonts.bodySemiBold, fontSize: 16, color: libraryTokens.ink}}>
              Go back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <GenerateReviewHeader
        onBack={() => navigation.goBack()}
        title={screenTitle}
        right={headerRight}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
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
          <View style={{marginBottom: layout.sectionGap}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.muted,
                marginBottom: 4,
              }}>
              {isEditing ? 'Editing' : 'Creating'}
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: compact ? 28 : 32,
                lineHeight: compact ? 36 : 40,
                letterSpacing: -0.64,
                fontWeight: '700',
                color: colors.onSurface,
              }}>
              {isEditing ? 'Update card' : 'Add a card'}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                lineHeight: 24,
                color: colors.muted,
                marginTop: 4,
              }}>
              {isEditing
                ? 'Edit the question or answer below'
                : 'Add a flashcard to this deck'}
            </Text>
          </View>

          <CardEditorFields
            question={question}
            answer={answer}
            onQuestionChange={value =>
              setValue('question', value, {shouldValidate: true, shouldDirty: true})
            }
            onAnswerChange={value =>
              setValue('answer', value, {shouldValidate: true, shouldDirty: true})
            }
            questionError={errors.question?.message}
            answerError={errors.answer?.message}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{paddingBottom: tabClearance}}>
        <EditCardFooter
          isEditing={isEditing}
          saving={isSubmitting}
          deleting={deleting}
          compact={compact}
          onSave={onSubmit}
          onDelete={isEditing ? confirmDelete : undefined}
        />
      </View>
    </View>
  );
}
