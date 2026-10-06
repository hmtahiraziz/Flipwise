import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useLayoutEffect, useMemo, useState} from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {CardEditorFields} from '../../components/card/CardEditorFields';
import {EditCardFooter} from '../../components/card/EditCardFooter';
import {GenerateReviewHeader} from '../../components/generate/GenerateReviewHeader';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useCardMutations, useCards} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {getApiErrorMessage} from '../../lib/errors';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useReviewQueue} from '../../hooks/useReviews';
import {cardSchema, type CardFormValues} from '../../lib/schemas';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditCard'>;

function retentionFromReview(item: {
  review: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewDate: string;
  };
} | undefined) {
  if (!item) return null;
  const {easeFactor, intervalDays, repetitions, nextReviewDate} = item.review;
  const percent = Math.min(
    98,
    Math.max(12, Math.round((easeFactor - 1.3) * 40 + repetitions * 6)),
  );
  const label =
    percent >= 80 ? 'Solid' : percent >= 55 ? 'Building' : 'Fragile';
  const due = new Date(nextReviewDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dueLabel =
    diffDays <= 0
      ? 'Review due now'
      : `Review Due: ${due.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })} (in ${diffDays} day${diffDays === 1 ? '' : 's'})`;

  return {
    percent,
    label,
    dueLabel,
    repetitions,
    intervalDays,
  };
}

export function EditCardScreen({navigation, route}: Props) {
  const {deckId, cardId} = route.params;
  const isEditing = Boolean(cardId);
  const layout = useLibraryLayout();
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: deck} = useDeck(deckId);
  const {data: cards, isLoading} = useCards(deckId);
  const {data: queue = []} = useReviewQueue();
  const {createCard, updateCard, deleteCard} = useCardMutations(deckId);
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<'new' | 'edit'>(
    isEditing ? 'edit' : 'new',
  );
  const [showLivePreview, setShowLivePreview] = useState(true);

  const existing = cards?.find(card => card.id === cardId);
  const compact = layout.isNarrow;
  const tabClearance = layout.tabScrollBottomPadding;
  const deckTitle = deck?.title?.trim() || 'Deck';

  const reviewItem = useMemo(
    () => (cardId ? queue.find(item => item.card.id === cardId) : undefined),
    [cardId, queue],
  );
  const retention = useMemo(
    () => retentionFromReview(reviewItem),
    [reviewItem],
  );

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      question: '',
      answer: '',
      explanation: '',
      hint: '',
      cardType: 'basic',
    },
  });

  const question = watch('question');
  const answer = watch('answer');
  const explanation = watch('explanation') ?? '';
  const hint = watch('hint') ?? '';
  const cardType = watch('cardType') ?? 'basic';

  useLayoutEffect(() => {
    if (existing) {
      reset({
        question: existing.question,
        answer: existing.answer,
        explanation: existing.explanation ?? '',
        hint: existing.hint ?? '',
        cardType: existing.cardType === 'cloze' ? 'cloze' : 'basic',
      });
      setMode('edit');
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async values => {
    const payload: CardFormValues = {
      question: values.question.trim(),
      answer: values.answer.trim(),
      explanation: values.explanation?.trim() || undefined,
      hint: values.hint?.trim() || undefined,
      cardType: values.cardType ?? 'basic',
    };
    const saveAsEdit = mode === 'edit' && Boolean(cardId);
    try {
      if (saveAsEdit && cardId) {
        await updateCard(cardId, payload);
      } else {
        await createCard(payload);
      }
      toast.success(saveAsEdit ? 'Card saved' : 'Card created');
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
      toast.success('Card deleted');
      navigation.goBack();
    } catch (error) {
      toast.error('Could not delete card', getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = () => {
    reset({
      question: question,
      answer: answer,
      explanation: explanation,
      hint: hint,
      cardType: cardType,
    });
    setMode('new');
    toast.info('Duplicated', 'Editing a copy — save to create a new card.');
  };

  const cardIndex = useMemo(() => {
    if (!cardId || !cards?.length) return null;
    const idx = cards.findIndex(c => c.id === cardId);
    return idx >= 0 ? idx + 1 : null;
  }, [cardId, cards]);

  const headerRight = (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
      <Pressable
        onPress={() => setShowLivePreview(v => !v)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Toggle preview"
        className="active:opacity-80"
        style={{
          minHeight: 40,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderRadius: 999,
          backgroundColor: libraryTokens.surfaceContainerLow,
        }}>
        <MaterialIcons
          name="visibility"
          size={18}
          color={libraryTokens.muted}
        />
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 12,
            color: libraryTokens.muted,
          }}>
          Preview
        </Text>
      </Pressable>
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
          overflow: 'hidden',
          backgroundColor: libraryTokens.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ProfileAvatar
          name={user?.name}
          email={user?.email}
          imageUrl={user?.avatarUrl}
          size={32}
        />
      </Pressable>
    </View>
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
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: libraryTokens.ink,
              }}>
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
          title={mode === 'edit' ? 'Edit Card' : 'New Card'}
          subtitle={`Deck: ${deckTitle}`}
          closeIcon
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
            paddingTop: 12,
            paddingBottom: 24,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Mode switcher + tools */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}>
            <View
              style={{
                flexDirection: 'row',
                padding: 4,
                borderRadius: 999,
                backgroundColor: libraryTokens.surfaceContainerLow,
              }}>
              <Pressable
                onPress={() => {
                  if (isEditing) {
                    reset({
                      question: '',
                      answer: '',
                      explanation: '',
                      hint: '',
                      cardType: 'basic',
                    });
                  }
                  setMode('new');
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor:
                    mode === 'new' ? brandColors.surface : 'transparent',
                }}>
                <Text
                  style={{
                    fontFamily:
                      mode === 'new' ? fonts.bodyBold : fonts.bodySemiBold,
                    fontSize: 12,
                    color:
                      mode === 'new' ? libraryTokens.ink : libraryTokens.muted,
                  }}>
                  New Card
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (existing) {
                    reset({
                      question: existing.question,
                      answer: existing.answer,
                      explanation: existing.explanation ?? '',
                      hint: existing.hint ?? '',
                      cardType:
                        existing.cardType === 'cloze' ? 'cloze' : 'basic',
                    });
                    setMode('edit');
                  }
                }}
                disabled={!isEditing}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor:
                    mode === 'edit' ? brandColors.surface : 'transparent',
                  opacity: isEditing ? 1 : 0.45,
                }}>
                {mode === 'edit' ? (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: libraryTokens.primaryContainer,
                    }}
                  />
                ) : null}
                <Text
                  style={{
                    fontFamily:
                      mode === 'edit' ? fonts.bodyBold : fonts.bodySemiBold,
                    fontSize: 12,
                    color:
                      mode === 'edit' ? libraryTokens.ink : libraryTokens.muted,
                  }}>
                  Edit Card{cardIndex != null ? ` #${cardIndex}` : ''}
                </Text>
              </Pressable>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Pressable
                accessibilityLabel="Duplicate card"
                onPress={handleDuplicate}
                className="active:opacity-80"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: libraryTokens.surfaceContainerLow,
                }}>
                <MaterialIcons
                  name="content-copy"
                  size={20}
                  color={libraryTokens.muted}
                />
              </Pressable>
              {isEditing ? (
                <Pressable
                  accessibilityLabel="Delete card"
                  onPress={confirmDelete}
                  disabled={deleting}
                  className="active:opacity-80"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 218, 214, 0.45)',
                  }}>
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={libraryTokens.error}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          <CardEditorFields
            question={question}
            answer={answer}
            explanation={explanation}
            hint={hint}
            cardType={cardType}
            onQuestionChange={value =>
              setValue('question', value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onAnswerChange={value =>
              setValue('answer', value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onExplanationChange={value =>
              setValue('explanation', value, {shouldDirty: true})
            }
            onHintChange={value => setValue('hint', value, {shouldDirty: true})}
            onCardTypeChange={value =>
              setValue('cardType', value, {shouldDirty: true})
            }
            questionError={errors.question?.message}
            answerError={errors.answer?.message}
            retention={retention}
            showPreview={showLivePreview}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{paddingBottom: tabClearance}}>
        <EditCardFooter
          isEditing={isEditing && mode === 'edit'}
          saving={isSubmitting}
          deleting={deleting}
          compact={compact}
          onSave={onSubmit}
          onCancel={() => navigation.goBack()}
          onDelete={isEditing ? confirmDelete : undefined}
        />
      </View>
    </View>
  );
}
