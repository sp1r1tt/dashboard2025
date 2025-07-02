// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Токен отсутствует' }, { status: 401 });
    }

    jwt.verify(token, SECRET_KEY);

    const id = params.id;
    const [products] = await query('SELECT id FROM products WHERE id = ?', [id]) as any[];
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'Продукт не найден' }, { status: 404 });
    }

    await query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Продукт удален' }, { status: 200 });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: 'Ошибка сервера', error: String(error) }, { status: 500 });
  }
}