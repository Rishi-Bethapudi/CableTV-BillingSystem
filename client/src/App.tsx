import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';

// --- Page Imports ---
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Agents from './pages/Agents';
import Expenses from './pages/Expenses';
import CollectionDashboard from './pages/Collection';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';

// 🔹 Initialize QueryClient once
const queryClient = new QueryClient();

export const AppRoutes = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-customer" element={<AddCustomer />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="products" element={<Products />} />
        <Route path="agents" element={<Agents />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="collection" element={<CollectionDashboard />} />

        <Route
          path="reports"
          element={
            <div className="p-8 text-center text-slate-500">
              Reports module coming soon...
            </div>
          }
        />
        <Route
          path="complaints"
          element={
            <div className="p-8 text-center text-slate-500">
              Complaints module coming soon...
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="p-8 text-center text-slate-500">
              Settings module coming soon...
            </div>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 🔹 Main App (Root Component)
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="cabletv-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
