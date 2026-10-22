import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useLayoutEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CardEditorFields} from '../../components/card/CardEditorFields';
import {EditCardFooter} from '../../components/card/EditCardFooter';
import {GenerateReviewHeader} from '../../components/generate/GenerateReviewHeader';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {appAlert} from '../../components/ui/AppAlert';
import {keyboardScrollProps} from '../../components/ui/KeyboardSafeView';
import {toast} from '../../components/ui/Toast';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useCardMutations, useCards} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {getApiErrorMessage} from '../../lib/errors';
import {cardSchema, type CardFormValues} from '../../lib/schemas';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditCard'>;

export function EditCardScreen({navigation, route}: Props) {
  const {deckId, cardId} = route.params;
  const isEditing = Boolean(cardId);
  const layout = useLibraryLayout();
  const insets = useSafeAreaInsets();
  const {data: deck} = useDeck(deckId);
  const {data: cards, isLoading} = useCards(deckId);
  const {createCard, updateCard, deleteCard} = useCardMutations(deckId);
  const [deleting, setDeleting] = useState(false);

  const existing = cards?.find(card => card.id === cardId);
  const compact = layout.isNarrow;
  // Tab bar is hidden on EditCard — only pad for the system gesture/nav bar.
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const deckTitle = deck?.title?.trim() || 'Deck';

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
    try {
      if (isEditing && cardId) {
        await updateCard(cardId, payload);
      } else {
        await createCard(payload);
      }
      toast.success(isEditing ? 'Card saved' : 'Card created');
      navigation.goBack();
    } catch (error) {
      toast.error('Could not save card', getApiErrorMessage(error));
    }
  });

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

  const confirmDelete = () => {
    if (!cardId) return;
    appAlert('Delete card', 'This card will be permanently removed.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void handleDelete(),
      },
    ]);
  };

  const headerRight = <HeaderProfileButton size={30} />;

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
        title={isEditing ? 'Edit Card' : 'New Card'}
        subtitle={`Deck: ${deckTitle}`}
        right={headerRight}
      />

      <View className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          bottomOffset={24}
          {...keyboardScrollProps}
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 12,
            paddingBottom: 24,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}>
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
            showPreview
            onDelete={isEditing ? confirmDelete : undefined}
            deleting={deleting}
          />
        </KeyboardAwareScrollView>
      </View>

      <View style={{paddingBottom: safeBottom, backgroundColor: brandColors.surface}}>
        <EditCardFooter
          isEditing={isEditing}
          saving={isSubmitting}
          disabled={deleting}
          compact={compact}
          onSave={onSubmit}
          onCancel={() => navigation.goBack()}
        />
      </View>
    </View>
  );
}
