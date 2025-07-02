import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Токен есть — пропускаем
}

export const config = {
  matcher: ['/dashboard', '/products', '/groups', '/users', '/settings', '/'], // можно добавить другие защищённые маршруты
};
