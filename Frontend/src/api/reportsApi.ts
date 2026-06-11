import axiosInstance from './axiosConfig';

type ExportEntity = 'appointments' | 'payments' | 'reviews';
type ExportFormat = 'json' | 'csv' | 'excel';

export const exportData = async (
  entity: ExportEntity,
  format: ExportFormat
): Promise<void> => {
  if (format === 'json') {
    const response = await axiosInstance.get(`/reports/${entity}/json`);
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, `${entity}.json`);
    return;
  }

  const mimeType =
    format === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const extension = format === 'csv' ? 'csv' : 'xlsx';

  const response = await axiosInstance.get(`/reports/${entity}/${format}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: mimeType });
  downloadBlob(blob, `${entity}.${extension}`);
};

export interface ImportResult {
  totalImported: number;
  totalErrors: number;
  imported: string[];
  errors: string[];
}

export const importReviewsCsv = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<ImportResult>(
    '/reports/reviews/import-csv',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data;
};

const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
