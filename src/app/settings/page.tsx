// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form, Alert } from 'react-bootstrap';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    password: '',
  });
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить профиль');
        }

        const data = await response.json();
        setUserProfile({ name: data.name, email: data.email, password: '' });
        setFormData({ name: data.name, email: data.email, password: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        router.push('/login'); // Redirect to login if token is invalid
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при обновлении профиля');
      }

      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка, попробуйте снова');
    }
  };

  const confirmUpdate = () => {
    setUserProfile({ ...formData });
    setShowModal(false);
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
                  <div className="card-header-custom">
                    <h2 className="card-title">{t('profileSettings')}</h2>
                  </div>
                  <div className="card-body-custom" style={{ padding: '1.5rem' }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4" controlId="formName">
                        <Form.Label style={{ marginBottom: '0.5rem' }}>{t('name')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t('name')}
                          className="search-input"
                          style={{ padding: '0.75rem' }}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-4" controlId="formEmail">
                        <Form.Label style={{ marginBottom: '0.5rem' }}>{t('email')}</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t('email')}
                          className="search-input"
                          style={{ padding: '0.75rem' }}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-4" controlId="formPassword">
                        <Form.Label style={{ marginBottom: '0.5rem' }}>{t('newPassword')}</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder={t('newPassword')}
                          className="search-input"
                          style={{ padding: '0.75rem' }}
                        />
                      </Form.Group>
                      <Button variant="success" type="submit">
                        {t('saveChanges')}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </main>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('confirmChangesTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t('confirmChangesMessage')}</p>
            <ul style={{ paddingLeft: '1rem' }}>
              <li>
                <strong>{t('name')}:</strong> {formData.name}
              </li>
              <li>
                <strong>{t('email')}:</strong> {formData.email}
              </li>
              {formData.password && (
                <li>
                  <strong>{t('newPassword')}:</strong> {t('passwordWillChange')}
                </li>
              )}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={confirmUpdate}
              style={{ background: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}
            >
              {t('save')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}