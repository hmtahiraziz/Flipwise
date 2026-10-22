import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DeckDetailHeader} from '../../components/deck/DeckDetailHeader';
import {DeckEditorFields} from '../../components/deck/DeckEditorFields';
import {DeckFormFooter} from '../../components/deck/DeckFormFooter';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {appAlert} from '../../components/ui/AppAlert';
import {keyboardScrollProps} from '../../components/ui/KeyboardSafeView';
import {toast} from '../../components/ui/Toast';
import {brandColors, colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {deckSchema, type DeckFormValues} from '../../lib/schemas';
import {useDeck, useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditDeck'>;

export function EditDeckScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const layout = useLibraryLayout();
  const insets = useSafeAreaInsets();
  const {data: deck, isLoading, error} = useDeck(deckId);
  const {updateDeck, deleteDeck} = useDeckMutations();
  const [deleting, setDeleting] = useState(false);
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDeck(deckId);
      toast.success('Deck deleted');
      navigation.popToTop();
    } catch (err) {
      toast.error('Could not delete deck', getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    appAlert(
      'Delete deck',
      'This will permanently delete the deck and all its cards.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const onSubmit = handleSubmit(async values => {
    try {
      await updateDeck(deckId, {
        title: values.title.trim(),
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
      });
      toast.success('Deck updated');
      navigation.goBack();
    } catch (err) {
      toast.error('Could not update deck', getApiErrorMessage(err));
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
        <DeckDetailHeader
          title="Edit deck"
          titleColor={libraryTokens.ink}
          backIconColor={libraryTokens.ink}
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
        right={<HeaderProfileButton size={32} />}
        bordered={false}
      />

      <View className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          bottomOffset={24}
          {...keyboardScrollProps}
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: 24,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
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
            onDelete={confirmDelete}
            deleting={deleting}
          />
        </KeyboardAwareScrollView>
      </View>

      <View style={{paddingBottom: safeBottom, backgroundColor: brandColors.surface}}>
        <DeckFormFooter
          label="Save changes"
          saving={isSubmitting}
          disabled={!isDirty || deleting}
          onCancel={() => navigation.goBack()}
          onPress={() => void onSubmit()}
        />
      </View>
    </View>
  );
}
