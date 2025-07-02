// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

interface Product {
  id: number;
  group_id: number;
  name: string;
  serial: string;
  status: 'Свободен' | 'В работе' | 'Резерв';
  created_at: string;
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

    const products = (await query('SELECT id, group_id, name, serial, status, created_at FROM products') as Product[]) || [];

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}