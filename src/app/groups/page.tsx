'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Group {
  id: number;
  title_en: string;
  title_ru: string;
  products: number;
  date_code: string;
  date_text: string;
  usd?: string;
  created_at?: string; // Added to match API response
}

export default function GroupsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('groups');
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Не удалось загрузить группы');
        }

        const data = await response.json();
        // Sort groups based on title_ru to match the desired order
        const sortedGroups = data.sort((a: Group, b: Group) => {
          const order = ['Длинное предлинное длиннючее название прихода', 'Длинное название прихода', 'Длинное краткое название прихода'];
          return order.indexOf(a.title_ru) - order.indexOf(b.title_ru);
        });
        setGroups(sortedGroups);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Произошла ошибка');
        if (error.message.includes('Токен отсутствует')) {
          router.push('/login');
        }
      }
    };

    fetchGroups();
  }, [router, locale]);

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (selectedGroup) {
      try {
        const response = await fetch(`/api/groups/${selectedGroup.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Не удалось удалить группу');
        }

        setGroups(groups.filter((g) => g.id !== selectedGroup.id));
        setShowModal(false);
        setSelectedGroup(null);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Произошла ошибка');
      }
    }
  };

  const parseDate = (dateText: string) => {
    const parts = dateText.split(/[/\s]+/);
    const day = parts[0] || '';
    const month = parts[1] || '';
    const year = parts[2] || '';
    return { day, month, year };
  };

  const getTranslatedMonth = (month: string) => {
    const monthMap: { [key: string]: string } = {
      'Янв': 'Янв',
      'Фев': 'Фев',
      'Мар': 'Мар',
      'Апр': 'Апр',
      'Май': 'Май',
      'Июн': 'Июн',
      'Июл': 'Июл',
      'Авг': 'Авг',
      'Сен': 'Сен',
      'Окт': 'Окт',
      'Ноя': 'Ноя',
      'Дек': 'Дек',
    };
    return monthMap[month] || month;
  };

  const normalizeCurrency = (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/(usd|\$)/gi, '').trim();
  };

  const getDisplayTitle = (group: Group) => {
    return locale === 'ru' ? group.title_ru : group.title_en || group.title_ru;
  };

  return (
    <div className="main-layout">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="main-content">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="content-body">
          <Container fluid>
            <Row className="g-4">
              <Col xl={12} lg={12}>
                <div className="custom-card fade-in">
                  <div className="card-body-custom">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {groups.map((group) => {
                      const { day, month, year } = parseDate(group.date_text);
                      const translatedMonth = getTranslatedMonth(month);
                      const usdCleanValue = normalizeCurrency(group.usd);
                      const usdFormatted = usdCleanValue
                        ? t('usd', { value: usdCleanValue })
                        : t('noValue');

                      return (
                        <div key={group.id} className="inventory-item">
                          <div className="item-icon">
                            <div className="title-icon">
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
                          </div>

                          <div className="item-content">
                            <div className="item-info">
                              <h4>{getDisplayTitle(group)}</h4>
                              <p>{t('productsPlural', { count: group.products })}</p>
                            </div>
                            <div className="item-date">
                              {t('dateCode', { code: group.date_code })}
                              <br />
                              {t('dateText', { day, monthAbbr: translatedMonth, year })}
                            </div>
                            <div className="item-price">
                              <div>{usdFormatted}</div>
                            </div>
                            <div className="item-actions">
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteClick(group)}
                                title={t('deleteTitle')}
                              >
                                <TrashIcon style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </main>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('modalTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedGroup && <p>{t('modalConfirm', { name: getDisplayTitle(selectedGroup) })}</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              {t('delete')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}