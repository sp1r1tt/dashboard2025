'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { InventoryItem, Group, Product } from '@/types';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface InventoryListProps {
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem) => void;
  groups: Group[];
  products: Product[];
}

export default function InventoryList({ selectedItem, onSelectItem, groups, products }: InventoryListProps) {
  const t = useTranslations('inventoryList');
  const locale = useLocale();

  // Map title_ru to translation keys
  const getTranslatedTitle = (title_ru?: string, title_en?: string) => {
    // If locale is English and title_en exists, use it
    if (locale === 'en' && title_en) {
      return title_en;
    }

    // If title_ru is undefined, return fallback
    if (!title_ru) {
      return t('defaultTitle', { defaultMessage: 'Untitled' });
    }

    // Map Russian titles to translation keys
    const titleMap: { [key: string]: string } = {
      'Длинное предлинное длиннючее название прихода': 'titleLongVeryLong',
      'Длинное название прихода': 'titleLong',
      'Длинное краткое название прихода': 'titleLongShort',
    };
    const translationKey = titleMap[title_ru] || 'defaultTitle';
    return t(translationKey, { defaultMessage: title_ru }); // Fallback to raw title_ru if key not found
  };

  const items = groups.map(group => ({
    ...group,
    type: 'group' as const,
    title: getTranslatedTitle(group.title_ru, group.title_en),
    title_ru: group.title_ru, // Preserve for sorting or other uses
    title_en: group.title_en,
    date: group.date_text ? `${group.date_code}\n${group.date_text}` : t('noDate'),
    items: group.products || 0,
    label: 'labelProducts',
    relatedProducts: products.filter(p => p.id >= (group.id - 1) * 2 + 1 && p.id <= group.id * 2),
  }));

  return (
    <div className="custom-card">
      <div className="card-header-custom">
        <h2 className="card-title">
          <div className="title-icon">
            <PlusIcon style={{ width: '16px', height: '16px', color: 'var(--primary-green)' }} />
          </div>
          {t('title', { count: items.length })}
        </h2>
      </div>

      <div className="card-body-custom">
        {items.map((item) => (
          <div
            key={item.id}
            className={`inventory-item ${selectedItem?.id === item.id ? 'active' : ''}`}
            onClick={() => onSelectItem(item)}
          >
            <div className="item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
                style={{ color: 'var(--primary-green)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75L12 3l8.25 3.75M3.75 6.75v6.75c0 .621.504 1.125 1.125 1.125h14.25a1.125 1.125 0 001.125-1.125V6.75M3.75 6.75L12 10.5m0 0l8.25-3.75M12 10.5v10.125"
                />
              </svg>
            </div>

            <div className="item-content">
              <div className="item-info">
                <h4>{item.title}</h4>
                <p>{t('productsPlural', { count: item.products ?? 0 })}</p>
              </div>
              <div className="item-date" style={{ whiteSpace: 'pre-line', maxHeight: '40px', overflow: 'hidden' }}>
                {item.date}
              </div>
              <div className="item-price">
                <div>{item.usd || t('noValue')}</div>
                <div>{item.uah || t('noValue')}</div>
              </div>
            </div>

            <div className="item-indicator">
              <div className="indicator-dot"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}