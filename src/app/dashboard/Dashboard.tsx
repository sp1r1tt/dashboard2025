'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import InventoryList from '@/components/inventory-list';
import InventoryDetails from '@/components/inventory-details';
import { InventoryItem, Group, Product } from '@/types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const t = useTranslations('groups');
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const fetchInventory = async () => {
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

        const productsResponse = await fetch('/api/inventory', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!productsResponse.ok) {
          const productsData = await productsResponse.json();
          throw new Error(productsData.message || 'Не удалось загрузить продукты');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        if (error.message.includes('Токен отсутствует')) {
          router.push('/login');
        }
      }
    };

    fetchInventory();
  }, [router, locale]);

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

  const getTitleKey = (title_ru: string | undefined): string => {
    // Provide a fallback if title_ru is undefined
    if (!title_ru) return 'titleLongShort'; // Default key as a fallback
    if (title_ru === 'Длинное предлинное длиннючее название прихода') return 'titleLongVeryLong';
    if (title_ru === 'Длинное название прихода') return 'titleLong';
    if (title_ru === 'Длинное краткое название прихода') return 'titleLongShort';
    return 'titleLongShort'; // Fallback for unmatched titles
  };

  const barChartData = {
    labels: groups.map((group) => {
      const fallbackTitle = group.title_ru || group.title_en || 'Unnamed Group'; // Use title_ru as primary
      return fallbackTitle.slice(0, 20) + (fallbackTitle.length > 20 ? '...' : ''); // Truncate long titles
    }),
    datasets: [
      {
        label: t('barchartdata'),
        data: groups.map((group) => group.products || 0),
        backgroundColor: 'var(--primary-green)',
      },
    ],
  };

  const pieChartData = {
    labels: [
      t('statusFree'),
      t('statusInUse'),
      t('statusReserved'),
    ],
    datasets: [
      {
        data: [
          products.filter((p) => p.status === 'Свободен').length,
          products.filter((p) => p.status === 'В работе').length,
          products.filter((p) => p.status === 'Резерв').length,
        ],
        backgroundColor: ['var(--primary-green)', '#FF8042', '#FFD700'],
        borderColor: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: { x: { ticks: { angle: -45, maxRotation: 0, minRotation: -45 } } },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, tooltip: { mode: 'index' as const, intersect: false } },
  };

  return (
    <div className="main-layout">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="main-content">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="content-body">
          <Container fluid>
            <Row className="g-4 mb-4">
              <Col xl={6} lg={6}>
                <div className="custom-card fade-in">
                  <div className="card-header-custom">
                    <h2 className="card-title">{t('groupproducts')}</h2>
                  </div>
                  <div className="card-body-custom" style={{ height: '300px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
              </Col>
              <Col xl={6} lg={6}>
                <div className="custom-card fade-in">
                  <div className="card-header-custom">
                    <h2 className="card-title">{t('productstatus')}</h2>
                  </div>
                  <div className="card-body-custom" style={{ height: '300px' }}>
                    <Pie data={pieChartData} options={pieChartOptions} />
                  </div>
                </div>
              </Col>
            </Row>
            <Row className="g-4">
              <Col xl={8} lg={7}>
                <InventoryList
                  selectedItem={selectedItem}
                  onSelectItem={(item: InventoryItem) => setSelectedItem(item)}
                  groups={groups}
                  products={products}
                />
              </Col>
              <Col xl={4} lg={5}>
                <InventoryDetails item={selectedItem} products={products} groups={groups} />
              </Col>
            </Row>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Container>
        </main>
      </div>
    </div>
  );
}