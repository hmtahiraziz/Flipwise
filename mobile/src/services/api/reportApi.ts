import {apiClient} from './client';
import type {
  ContentReportResponse,
  CreateContentReportRequest,
} from '../../types/api';

export async function createContentReport(
  input: CreateContentReportRequest,
): Promise<ContentReportResponse['report']> {
  const {data} = await apiClient.post<ContentReportResponse>(
    '/api/reports',
    input,
  );
  return data.report;
}
