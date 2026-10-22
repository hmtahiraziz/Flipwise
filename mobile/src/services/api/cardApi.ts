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

const GENERATE_TIMEOUT_MS = 180000;
const IMPORT_TIMEOUT_MS = 90000;

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
  input: Omit<GenerateCardsRequest, 'aiConsent'>,
  signal?: AbortSignal,
): Promise<FlashcardDraft[]> {
  const {data} = await apiClient.post<GenerateCardsResponse>(
    `/api/decks/${deckId}/cards/generate`,
    {...input, aiConsent: true},
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
  // Needed when the PDF is scanned (no text layer) so the server can OCR pages.
  formData.append('aiConsent', 'true');

  // Do not set Content-Type — RN must attach the multipart boundary.
  const {data} = await apiClient.post<ImportSourceResponse>(
    `/api/decks/${deckId}/cards/import/pdf`,
    formData,
    {timeout: IMPORT_TIMEOUT_MS},
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

export async function importScanImage(
  deckId: string,
  file: {uri: string; name: string; type?: string},
): Promise<ImportSourceResponse> {
  const mime = (file.type ?? 'image/jpeg').toLowerCase();
  const safeType =
    mime === 'image/jpg' || !mime.startsWith('image/')
      ? 'image/jpeg'
      : mime;
  const safeName = /\.(jpe?g|png|webp|gif)$/i.test(file.name)
    ? file.name
    : `${file.name.replace(/\.[^.]+$/, '') || 'scan'}.jpg`;

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: safeName,
    type: safeType,
  } as unknown as Blob);
  formData.append('aiConsent', 'true');

  // Do not set Content-Type — RN must attach the multipart boundary.
  const {data} = await apiClient.post<ImportSourceResponse>(
    `/api/decks/${deckId}/cards/import/image`,
    formData,
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
