'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheckIcon,
  InboxIcon,
  TagIcon,
  CubeIcon,
  UsersIcon,
  CogIcon,
  ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcherMobile} from '../components/LanguageSwitcher-mobile'

const navigation = [
  { name: 'arrivals', href: '/dashboard', icon: InboxIcon },
  { name: 'groups', href: '/groups', icon: TagIcon },
  { name: 'products', href: '/products', icon: CubeIcon },
  { name: 'users', href: '/users', icon: UsersIcon },
  { name: 'settings', href: '/settings', icon: CogIcon },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log(t('logoutRequest'));
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(t('logoutResponse', { status: response.status }));
      const data = await response.json();
      console.log(t('logoutData', { data: JSON.stringify(data) }));

      if (!response.ok) {
        throw new Error(t('logoutError'));
      }

      console.log(t('logoutRedirect'));
      router.push('/login');
    } catch (error) {
      console.error(t('logoutError'), error);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <div className={`sidebar-container ${open ? 'show' : ''}`}>
        <div className="sidebar">
          <div className="logo-section">
            <div className="logo-icon">
              <ShieldCheckIcon style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span className="logo-text">{t('inventory')}</span>
          </div>
          <div className="user-profile">
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-info">
              <div className="user-name">{t('admin')}</div>
              <div className="user-email">{t('adminEmail')}</div>
            </div>
            <button className="close-btn" onClick={handleLogout}>
              <ArrowLeftEndOnRectangleIcon style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <nav className="nav-container">
            <ul className="nav-menu">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name} className="nav-item">
                    <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                      <item.icon className="nav-icon" />
                      {t(item.name)}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="language-switcher-mobile">
              <LanguageSwitcherMobile/>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}