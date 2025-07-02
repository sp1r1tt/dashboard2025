'use client'; // Ensure this is at the top to mark the component as client-side only

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Product, Group, User } from '@/types';
import { LanguageSwitcher } from '../components/LanguageSwitcher'; // Adjust the import path as needed

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  onSearch?: (query: string, results: (Product | Group | User)[]) => void;
}

export function Header({ setSidebarOpen, onSearch }: HeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Product | Group | User)[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, groupsRes, usersRes] = await Promise.all([
          fetch('/api/products', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('/api/groups', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('/api/users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
        ]);

        if (!productsRes.ok) throw new Error('Failed to fetch products');
        if (!groupsRes.ok) throw new Error('Failed to fetch groups');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const productsData = await productsRes.json();
        const groupsData = await groupsRes.json();
        const usersData = await usersRes.json();

        setProducts(productsData);
        setGroups(groupsData);
        setUsers(usersData);
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Error fetching data');
      }
    };

    fetchData();
  }, []);

  const locale = typeof window !== 'undefined' ? document.documentElement.lang : 'en';
  const isEnglish = locale === 'en';
  const dateLocale = locale === 'ru' ? ru : enUS;

  const formattedDate = format(currentDateTime, 'dd MMM, yyyy', { locale: dateLocale });
  const formattedTime = format(currentDateTime, 'HH:mm');


  const includesWithTranslation = (original: string, translationKey: string, query: string) => {
    const translated = t(translationKey);
    const lowerQuery = query.toLowerCase();
    return original.toLowerCase().includes(lowerQuery) || translated.toLowerCase().includes(lowerQuery);
  };

  const detectLanguage = (text: string) => {
    return /[а-яА-ЯЁё]/.test(text) ? 'ru' : 'en';
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      onSearch?.('', []);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const queryLanguage = detectLanguage(query);

    const productResults = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.serial && product.serial.toLowerCase().includes(lowerQuery))
    );

    const groupResults = groups.filter((group) => {
      const titleToSearch = queryLanguage === 'ru' ? group.title_ru : group.title_en;
      return titleToSearch?.toLowerCase().includes(lowerQuery) || false;
    });

    const userResults = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        includesWithTranslation(user.name, `users.names.${user.name.split(' ')[0].toLowerCase()}`, query)
      );
    });

    const results = [...productResults, ...groupResults, ...userResults];
    setSearchResults(results);
    onSearch?.(query, results);
  };

  const handleResultClick = (result: Product | Group | User) => {
    if ('serial' in result) {
      router.push('/products');
    } else if ('title_en' in result) {
      router.push('/groups');
    } else if ('email' in result) {
      router.push('/users');
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const getResultKey = (result: Product | Group | User): string => {
    if ('serial' in result) return `product-${result.id}`;
    else if ('title_en' in result) return `group-${result.id}`;
    else if ('email' in result) return `user-${result.email}`;
    return 'unknown';
  };

  const getDisplayedTitle = (result: Group) => {
    return locale === 'ru' ? result.title_ru || result.title_en : result.title_en || result.title_ru;
  };

  return (
    <div className="content-header">
      <div className="header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Bars3Icon style={{ width: '24px', height: '24px' }} />
        </button>

        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            className="search-input"
            placeholder={t('header.searchPlaceholder')}
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-results-dropdown" style={styles.searchResults}>
              {searchResults.map((result) => (
                <div
                  key={getResultKey(result)}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                  style={styles.searchResultItem}
                >
                  {isProduct(result) ? (
                    <div>
                      <strong>{result.name}</strong> ({result.serial})
                    </div>
                  ) : isGroup(result) ? (
                    <div>
                      <strong>{getDisplayedTitle(result as Group)}</strong>
                    </div>
                  ) : isUser(result) ? (
                    <div>
                      <strong>{result.name}</strong> ({result.email})
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div className="header-info">
            <div className="language-switcher">
              <LanguageSwitcher />
            </div>
          <div className="header-date-time">
            <div className="header-date">{t('header.today')}</div>
            <div className="header-time" suppressHydrationWarning>
              {formattedDate} ⏰ {formattedTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type guards
function isProduct(result: Product | Group | User): result is Product {
  return 'serial' in result;
}

function isGroup(result: Product | Group | User): result is Group {
  return 'title_en' in result;
}

function isUser(result: Product | Group | User): result is User {
  return 'email' in result;
}

const styles = {
  searchResults: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid var(--border-gray)',
    borderRadius: 'var(--border-radius)',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: 'var(--shadow-sm)',
  },
  searchResultItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-gray)',
  },
  error: {
    color: 'red',
    fontSize: '0.875rem',
    padding: '8px',
  },
};