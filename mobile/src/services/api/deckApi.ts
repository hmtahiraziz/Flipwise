import {apiClient} from './client';
import type {
  Deck,
  DeckListResponse,
  DeckResponse,
} from '../../types/api';
import type {DeckFormValues} from '../../lib/schemas';

export type UpdateDeckInput = Partial<DeckFormValues> & {
  isArchived?: boolean;
};

export async function fetchDecks(): Promise<Deck[]> {
  const {data} = await apiClient.get<DeckListResponse>('/api/decks');
  return data.decks;
}

export async function fetchDeck(deckId: string): Promise<Deck> {
  const {data} = await apiClient.get<DeckResponse>(`/api/decks/${deckId}`);
  return data.deck;
}

export async function createDeck(input: DeckFormValues): Promise<Deck> {
  const {data} = await apiClient.post<DeckResponse>('/api/decks', input);
  return data.deck;
}

export async function updateDeck(
  deckId: string,
  input: UpdateDeckInput,
): Promise<Deck> {
  const {data} = await apiClient.patch<DeckResponse>(
    `/api/decks/${deckId}`,
    input,
  );
  return data.deck;
}

export async function deleteDeck(deckId: string): Promise<void> {
  await apiClient.delete(`/api/decks/${deckId}`);
}
