import {apiClient} from './client';
import type {
  BulkCardsResponse,
  CardListResponse,
  CardResponse,
  Flashcard,
  FlashcardDraft,
  GenerateCardsRequest,
  GenerateCardsResponse,
  ImportSourceResponse,
} from '../../types/api';
import type {CardFormValues} from '../../lib/schemas';

const GENERATE_TIMEOUT_MS = 120000;
const IMPORT_TIMEOUT_MS = 60000;

export async function fetchCards(deckId: string): Promise<Flashcard[]> {
  const {data} = await apiClient.get<CardListResponse>(
    `/api/decks/${deckId}/cards`,
  );
  return data.cards;
}

export async function createCard(
  deckId: string,
  input: CardFormValues,
): Promise<Flashcard> {
  const {data} = await apiClient.post<CardResponse>(
    `/api/decks/${deckId}/cards`,
    input,
  );
  return data.card;
}

export async function createCardsBulk(
  deckId: string,
  cards: FlashcardDraft[],
): Promise<Flashcard[]> {
  const {data} = await apiClient.post<BulkCardsResponse>(
    `/api/decks/${deckId}/cards/bulk`,
    {cards},
  );
  return data.cards;
}

export async function generateCards(
  deckId: string,
  input: GenerateCardsRequest,
  signal?: AbortSignal,
): Promise<FlashcardDraft[]> {
  const {data} = await apiClient.post<GenerateCardsResponse>(
    `/api/decks/${deckId}/cards/generate`,
    input,
    {timeout: GENERATE_TIMEOUT_MS, signal},
  );
  return data.cards;
}

export async function importPdf(
  deckId: string,
  file: {uri: string; name: string; type?: string},
): Promise<ImportSourceResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type ?? 'application/pdf',
  } as unknown as Blob);

  const {data} = await apiClient.post<ImportSourceResponse>(
    `/api/decks/${deckId}/cards/import/pdf`,
    formData,
    {
      timeout: IMPORT_TIMEOUT_MS,
      headers: {'Content-Type': 'multipart/form-data'},
    },
  );
  return data;
}

export async function importUrl(
  deckId: string,
  url: string,
): Promise<ImportSourceResponse> {
  const {data} = await apiClient.post<ImportSourceResponse>(
    `/api/decks/${deckId}/cards/import/url`,
    {url},
    {timeout: IMPORT_TIMEOUT_MS},
  );
  return data;
}

export async function updateCard(
  cardId: string,
  input: Partial<CardFormValues>,
): Promise<Flashcard> {
  const {data} = await apiClient.patch<CardResponse>(
    `/api/cards/${cardId}`,
    input,
  );
  return data.card;
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiClient.delete(`/api/cards/${cardId}`);
}
