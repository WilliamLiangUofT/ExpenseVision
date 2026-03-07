import axios from 'axios';
import { Platform } from 'react-native';

const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

/**
 * Use EXPO_PUBLIC_API_BASE_URL for physical-device testing.
 * On iOS + Expo Go, an HTTPS tunnel URL is the most reliable option.
 */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// --- Receipt types (match backend schema) ---

export interface ReceiptItem {
  name: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
}

export interface ReceiptExtracted {
  merchant?: string | null;
  date_of_transaction?: string | null; // YYYY-MM-DD
  category?: string | null;
  subtotal?: number | null;
  tax?: number | null;
  total?: number | null;
  items_purchased: ReceiptItem[];
}

export interface ReceiptCreateResponse {
  receipt_id: number;
  receipt_items_inserted: number;
}

/** Extract receipt data from an image (multipart). Returns the extracted JSON schema. */
export async function extractReceipt(imageUri: string, mimeType: string = 'image/jpeg'): Promise<ReceiptExtracted> {
  const formData = new FormData();
  const name = imageUri.split('/').pop() || 'receipt.jpg';
  const normalizedUri =
    Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

  (formData as any).append('image', {
    uri: normalizedUri,
    type: mimeType,
    name,
  });

  const { data } = await api.post<ReceiptExtracted>('/api/receipts/extract', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: [(data) => data],
  });
  return data;
}

/** Save receipt to database. Pass the same payload returned from extract (or edited). */
export async function saveReceipt(payload: ReceiptExtracted): Promise<ReceiptCreateResponse> {
  const { data } = await api.post<ReceiptCreateResponse>('/api/receipts/save', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}
