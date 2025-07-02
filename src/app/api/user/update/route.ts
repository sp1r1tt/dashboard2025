// src/app/api/user/update/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Импортируем cookies из next/headers
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function PUT(request: Request) {
  try {
    // Получение токена из заголовка Authorization или cookies
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    // Проверка токена
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number; email: string };

    // Получение данных из тела запроса
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'Имя и email обязательны' }, { status: 400 });
    }

    // Проверка уникальности email
    const existingUsers = (await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, decoded.userId])) as any[];
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'Email уже используется' }, { status: 400 });
    }

    // Формирование SQL-запроса для обновления
    let updateQuery = 'UPDATE users SET name = ?, email = ?';
    const params = [name, email];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(decoded.userId);

    await query(updateQuery, params);

    return NextResponse.json({ message: 'Профиль успешно обновлен' }, { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}