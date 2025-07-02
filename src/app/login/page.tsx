
'use client';

import { useState, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../../components/LanguageSwitcher'; // Adjust path as needed

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations('login');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error(data.message || t('errorDefault'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorDefault'));
    }
  };

  return (
    <div
  className="main-layout"
  style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative' }}
>
  <div className="d-flex justify-content-center justify-content-md-end p-3">
    <LanguageSwitcher />
  </div>
  <main className="content-body">
    <Container fluid>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col xl={4} lg={6} md={8}>
          <div className="custom-card fade-in">
            <div className="card-header-custom">
              <h2 className="card-title">{t('title')}</h2>
            </div>
            <div className="card-body-custom" style={{ padding: '1.5rem' }}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>{t('emailLabel')}</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>{t('passwordLabel')}</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit">
                  {t('submitButton')}
                </Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  </main>
</div>
  );
}
