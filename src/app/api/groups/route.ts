// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

interface Product {
  id: number;
  name: string;
  serial: string;
  status: 'Свободен' | 'В работе' | 'Резерв';
  date_code?: string;
  date_text?: string;
  created_at: string;
}

interface Group {
  id: number;
  title_en: string;
  title_ru: string;
  products: number;
  date_code: string;
  date_text: string;
  usd?: string;
  created_at: string;
  relatedProduct?: Product; // Single product per group based on id match
}

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    jwt.verify(token, SECRET_KEY);

    const groups = (await query(
      'SELECT g.id, g.title_en, g.title_ru, g.products, g.date_code, g.date_text, g.usd, g.created_at, ' +
      'p.id AS product_id, p.name, p.serial, p.status, p.date_code AS p_date_code, p.date_text AS p_date_text, p.created_at AS product_created_at ' +
      'FROM `groups` g LEFT JOIN products p ON g.id = p.id',
      []
    ) as (Group & { product_id?: number; name?: string; serial?: string; status?: 'Свободен' | 'В работе' | 'Резерв'; p_date_code?: string; p_date_text?: string; product_created_at?: string })[]) || [];

    const groupedGroups: Group[] = [];
    const groupMap = new Map<number, Group>();

    groups.forEach(row => {
      if (!groupMap.has(row.id)) {
        groupMap.set(row.id, {
          id: row.id,
          title_en: row.title_en,
          title_ru: row.title_ru,
          products: row.products,
          date_code: row.date_code,
          date_text: row.date_text,
          usd: row.usd,
          created_at: row.created_at,
          relatedProduct: undefined
        });
        groupedGroups.push(groupMap.get(row.id)!);
      }
      if (row.product_id) {
        groupMap.get(row.id)!.relatedProduct = {
          id: row.product_id,
          name: row.name!,
          serial: row.serial!,
          status: row.status!,
          date_code: row.p_date_code,
          date_text: row.p_date_text,
          created_at: row.product_created_at!
        };
      }
    });

    return NextResponse.json(groupedGroups, { status: 200 });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}