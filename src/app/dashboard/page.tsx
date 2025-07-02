import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false });

const SECRET_KEY = process.env.JWT_SECRET || 'ваш_секрет';

export default function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('Invalid token:', err);
    redirect('/login');
  }

  return <Dashboard />;
}
