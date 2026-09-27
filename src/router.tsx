import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { LoadingPage } from './components/ui/Loading';
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage'));
const AccountDetailPage = lazy(() => import('./pages/accounts/AccountDetailPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const ImportPage = lazy(() => import('./pages/import/ImportPage'));
const TradesPage = lazy(() => import('./pages/trades/TradesPage'));
const TradeDetailPage = lazy(() => import('./pages/trades/TradeDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <LoginPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <RegisterPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },

  // Protected routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <SuspenseWrapper>
          <AppLayout />
        </SuspenseWrapper>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'accounts',
        element: (
          <SuspenseWrapper>
            <AccountsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'accounts/:accountId',
        element: (
          <SuspenseWrapper>
            <AccountDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'trades',
        element: (
          <SuspenseWrapper>
            <TradesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'trades/:tradeId',
        element: (
          <SuspenseWrapper>
            <TradeDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'journal',
        element: (
          <SuspenseWrapper>
            <PlaceholderPage title="ژورنال معاملاتی" description="ثبت و مدیریت ژورنال معاملات به زودی پیاده‌سازی می‌شود." />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'analytics',
        element: (
          <SuspenseWrapper>
            <AnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'calendar',
        element: (
          <SuspenseWrapper>
            <CalendarPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'reviews',
        element: (
          <SuspenseWrapper>
            <ReviewsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'import',
        element: (
          <SuspenseWrapper>
            <ImportPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <PlaceholderPage title="تنظیمات" description="تنظیمات حساب کاربری به زودی پیاده‌سازی می‌شود." />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Root redirect
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/app/dashboard" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
