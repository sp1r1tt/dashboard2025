'use client';

import { XMarkIcon, PlusIcon, TrashIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InventoryItem, Product, Group } from '@/types';
import { useTranslations } from 'next-intl';

interface InventoryDetailsProps {
  item: InventoryItem | null;
  products: Product[];
  groups: Group[];
}

export default function InventoryDetails({ item, products, groups }: InventoryDetailsProps) {
  const t = useTranslations('inventoryDetails');
  const [displayItem, setDisplayItem] = useState<{ product?: Product }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (item) {
      if (item.type === 'group') {
        const group = groups.find(g => g.id === item.id);
        const product = group?.relatedProduct;
        setDisplayItem({ product });
      } else if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        setDisplayItem({ product });
      }
    } else {
      setDisplayItem({});
    }
  }, [item, products, groups]);

  const handleDeleteClick = (productToDelete: Product) => {
    setSelectedProduct(productToDelete);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setDisplayItem({ product: undefined });
    }
    setShowModal(false);
    setSelectedProduct(null);
  };

  if (!item) {
    return (
      <div className="custom-card details-panel">
        <div className="card-body-custom">
          <div className="empty-state">
            <div className="empty-icon">
              <ComputerDesktopIcon style={{ width: '32px', height: '32px', color: 'var(--text-light)' }} />
            </div>
            <p>{t('emptyState')}</p>
          </div>
        </div>
      </div>
    );
  }

  const product = displayItem.product;

  return (
    <>
      <div className="custom-card details-panel">
        <div className="card-header-custom">
          <div className="details-header">
            <h3 className="details-title">{t('detailsTitle', { id: item.id })}</h3>
            <button className="close-btn">
              <XMarkIcon style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        <div className="card-body-custom">
          {/* Product Details Only */}
          {product && (
            <div className="inventory-item">
              <div className="item-content">
                <div className="item-info">
                  <h4>{product.name || 'Unnamed Product'}</h4>
                  <p>{product.serial || 'N/A'}</p>
                </div>
                <div className="item-date" style={{ whiteSpace: 'pre-line', maxHeight: '40px', overflow: 'hidden' }}>
                  {product.date_code || 'N/A'} <br /> {product.date_text || 'N/A'}
                </div>
                <div className="item-actions">
                  <span className="status-badge">
                    {product.status === 'Свободен' ? t('statusFree') : t('statusInUse')}
                  </span>
                  <button className="delete-btn" onClick={() => handleDeleteClick(product)}>
                    <TrashIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
              <div className="item-indicator">
                <div className="indicator-dot"></div>
              </div>
            </div>
          )}
        </div>

        <div className="add-product-section">
          <button className="add-product-btn">
            <PlusIcon style={{ width: '16px', height: '16px' }} />
            {t('addProduct')}
          </button>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('deleteProduct')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('confirmDelete', {
            name: selectedProduct?.name || '',
            serial: selectedProduct?.serial || '',
          })}
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
    </>
  );
}