// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/components/Layout';
import { AuthProvider, useAuth } from './components/layouts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- Page Imports ---
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Agents from './pages/Agents';
import Expenses from './pages/Expenses';
import Collection from './pages/Collection';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

// This new component contains all the routes and can access the auth context
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Login Route: If user is already logged in, redirect them to the dashboard */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* --- Protected Routes --- */}
      {/* All application routes are now wrapped in ProtectedRoute */}
      {/* The Layout component is now INSIDE the protected route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <ProtectedRoute>
            <Layout>
              <Agents />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Layout>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collection"
        element={
          <ProtectedRoute>
            <Layout>
              <Collection />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8 text-center text-slate-500">
                Reports module coming soon...
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8 text-center text-slate-500">
                Complaints module coming soon...
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8 text-center text-slate-500">
                Settings module coming soon...
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="cabletv-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* AuthProvider must wrap the routes to provide context */}
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
