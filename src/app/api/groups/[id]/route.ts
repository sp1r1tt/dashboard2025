// src/app/api/groups/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Проверка авторизации
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    jwt.verify(token, SECRET_KEY); // Проверка токена

    const id = params.id;

    // Проверка существования группы
    const [groups] = await query('SELECT id FROM `groups` WHERE id = ?', [id]) as any[];
    if (!groups || groups.length === 0) {
      return NextResponse.json({ message: 'Группа не найдена' }, { status: 404 });
    }

    // Удаление группы
    await query('DELETE FROM `groups` WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Группа удалена' }, { status: 200 });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}