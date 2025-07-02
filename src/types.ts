import { ComponentType } from 'react';

export type IconType = ComponentType<{ style?: React.CSSProperties; className?: string }>;

export interface Product {
  id: number;
  name: string;
  serial: string;
  status: 'Свободен' | 'В работе' | 'Резерв';
  date_code?: string;
  date_text?: string;
  icon?: IconType;
  created_at?: string;
}

export interface Group {
  id: number;
  title?: string;
  title_en?: string;
  title_ru?: string;
  products: number;
  date_code: string;
  date_text: string;
  usd?: string;
  uah?: string;
  created_at?: string;
  relatedProduct?: Product; // Updated to match the API response
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface InventoryItem {
  id: number;
  title_ru?: string;
 title_en?: string;
  products?: number;
  date_code?: string;
  date_text?: string;
  usd?: string;
  uah?: string;
  date?: string;
  items?: number;
  label?: string;
  status?: string;
  type?: 'group' | 'product';
  relatedProducts?: Product[];
}