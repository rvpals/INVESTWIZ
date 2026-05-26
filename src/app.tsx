import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { Layout } from '@/components/layout';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/portfolios" element={<Placeholder title="Portfolios" />} />
            <Route path="/watchlists" element={<Placeholder title="Watchlists" />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/goals" element={<Placeholder title="Goals" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}
