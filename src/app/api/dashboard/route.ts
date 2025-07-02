// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    jwt.verify(token, SECRET_KEY);

    const [groupsCount] = await query('SELECT COUNT(*) as count FROM `groups`') as { count: number }[];
    const [productsCount] = await query('SELECT COUNT(*) as count FROM products') as { count: number }[];

    return NextResponse.json({
      groupsCount: groupsCount.count,
      productsCount: productsCount.count,
    }, { status: 200 });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}