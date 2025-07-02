'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  group_id: number;
  name: string;
  serial: string;
  status: 'Свободен' | 'В работе' | 'Резерв';
}

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('products');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || t('errorLoading'));
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        if (error.message.includes('Токен отсутствует')) {
          router.push('/login');
        }
      }
    };

    fetchProducts();
  }, [router, t]);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || t('errorDeleting'));
        }

        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        setShowModal(false);
        setSelectedProduct(null);
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
                  <div className="card-header-custom">
                    <h2 className="card-title">{t('title')}</h2>
                  </div>
                  <div className="card-body-custom">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {products.length === 0 ? (
                      <div className="empty-state">
                        <p>{t('empty')}</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="inventory-item">
                          <div className="item-content">
                            <div className="item-info">
                              <h4>{product.name || 'Unnamed Product'}</h4>
                              <p>
                                <strong>{t('serialLabel')}:</strong> {product.serial || 'N/A'}
                              </p>
                              <p>
                                <strong>{t('statusLabel')}:</strong>{' '}
                                {product.status
                                  ? t(
                                      product.status === 'Свободен'
                                        ? 'statusFree'
                                        : product.status === 'В работе'
                                        ? 'statusInUse'
                                        : 'statusReserved'
                                    )
                                  : 'N/A'}
                              </p>
                            </div>
                            <div className="item-actions">
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteClick(product)}
                                title={t('deleteTitle')}
                              >
                                <TrashIcon style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </main>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('deleteTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <p>
                {t('deleteConfirm', {
                  name: selectedProduct.name || 'Unnamed Product',
                  serial: selectedProduct.serial || 'N/A',
                })}
              </p>
            )}
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