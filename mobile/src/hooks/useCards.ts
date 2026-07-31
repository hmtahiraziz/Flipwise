import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createCard,
  createCardsBulk,
  deleteCard,
  fetchCards,
  generateCards,
  importPdf,
  importUrl,
  updateCard,
} from '../services/api/cardApi';
import {deckKeys} from './useDecks';
import type {CardFormValues, GenerateCardsFormValues} from '../lib/schemas';
import type {FlashcardDraft} from '../types/api';

export const cardKeys = {
  all: (deckId: string) => ['cards', deckId] as const,
};

export function useCards(deckId: string) {
  return useQuery({
    queryKey: cardKeys.all(deckId),
    queryFn: () => fetchCards(deckId),
  });
}

export function useCardMutations(deckId: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({queryKey: cardKeys.all(deckId)});
    await queryClient.invalidateQueries({queryKey: deckKeys.detail(deckId)});
    await queryClient.invalidateQueries({queryKey: deckKeys.all});
  };

  return {
    generateCards: async (
      input: GenerateCardsFormValues,
      signal?: AbortSignal,
    ) => {
      return generateCards(deckId, input, signal);
    },
    importPdf: async (file: {uri: string; name: string; type?: string}) => {
      return importPdf(deckId, file);
    },
    importUrl: async (url: string) => {
      return importUrl(deckId, url);
    },
    saveCardsBulk: async (cards: FlashcardDraft[]) => {
      const saved = await createCardsBulk(deckId, cards);
      await invalidate();
      return saved;
    },
    createCard: async (input: CardFormValues) => {
      const card = await createCard(deckId, input);
      await invalidate();
      return card;
    },
    updateCard: async (cardId: string, input: Partial<CardFormValues>) => {
      const card = await updateCard(cardId, input);
      await invalidate();
      return card;
    },
    deleteCard: async (cardId: string) => {
      await deleteCard(cardId);
      await invalidate();
    },
  };
}
