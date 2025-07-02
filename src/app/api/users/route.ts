// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

interface User {
  id: number;
  name: string;
  email: string;
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

    const users = (await query('SELECT id, name, email, created_at FROM users') as User[]) || [];

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}