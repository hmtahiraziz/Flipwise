import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createDeck,
  deleteDeck,
  fetchDeck,
  fetchDecks,
  updateDeck,
  type UpdateDeckInput,
} from '../services/api/deckApi';
import type {DeckFormValues} from '../lib/schemas';

export const deckKeys = {
  all: ['decks'] as const,
  detail: (id: string) => ['decks', id] as const,
};

export function useDecks() {
  return useQuery({
    queryKey: deckKeys.all,
    queryFn: fetchDecks,
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: deckKeys.detail(deckId),
    queryFn: () => fetchDeck(deckId),
  });
}

export function useDeckMutations() {
  const queryClient = useQueryClient();

  const invalidateDecks = async (deckId?: string) => {
    await queryClient.invalidateQueries({queryKey: deckKeys.all});
    if (deckId) {
      await queryClient.invalidateQueries({queryKey: deckKeys.detail(deckId)});
    }
  };

  return {
    createDeck: async (input: DeckFormValues) => {
      const deck = await createDeck(input);
      await invalidateDecks();
      return deck;
    },
    updateDeck: async (deckId: string, input: UpdateDeckInput) => {
      const deck = await updateDeck(deckId, input);
      await invalidateDecks(deckId);
      return deck;
    },
    deleteDeck: async (deckId: string) => {
      await deleteDeck(deckId);
      await invalidateDecks();
    },
  };
}
