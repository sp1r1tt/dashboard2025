// src/app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('users');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Не удалось загрузить пользователей');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        if (error.message.includes('Токен отсутствует')) {
          router.push('/login');
        }
      }
    };

    fetchUsers();
  }, [router]);

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Не удалось удалить пользователя');
        }

        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setShowModal(false);
        setSelectedUser(null);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    }
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
                    {users.map((user) => (
                      <div key={user.id} className="inventory-item">
                        <div className="item-content">
                          <div className="item-info">
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                          </div>
                          <div className="item-actions">
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteClick(user)}
                              title={t('deleteTitle')}
                            >
                              <TrashIcon style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
            {selectedUser && <p>{t('modalConfirm', { name: selectedUser.name })}</p>}
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