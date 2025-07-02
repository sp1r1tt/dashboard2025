// src/app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Импортируем cookies из next/headers
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function GET(request: Request) {
  try {
    // Получение токена из заголовка Authorization или cookies
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    // Проверка токена
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number; email: string };

    // Получение данных пользователя из базы
    const users = (await query('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json(users[0], { status: 200 });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}