'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState('en');

  // Получаем текущий язык из тега <html lang="..."> при загрузке
  useEffect(() => {
    const currentLang = document.documentElement.lang || 'en';
    setLocale(currentLang);
  }, []);

  const handleChangeLocale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // Сохраняем выбор в cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;

    // Принудительно обновляем страницу без перезагрузки
    router.refresh();

    // Обновляем локальное состояние (для мгновенного отображения)
    setLocale(newLocale);
  };

  return (
    <div style={{ position: 'absolute', top: 16, right: 190, zIndex: 100 }}>
      <select
        className="form-select"
        value={locale}
        onChange={handleChangeLocale}
        style={{
          width: '120px',
          fontSize: '0.875rem',
          padding: '0.375rem 1.5rem 0.475rem 0.75rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-gray)',
          backgroundColor: 'white',
          color: 'var(--text-dark)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          appearance: 'none',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'var(--text-light)\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <option value="en">🇬🇧 English</option>
        <option value="ru">🇷🇺 Русский</option>
      </select>
    </div>
  );
}
