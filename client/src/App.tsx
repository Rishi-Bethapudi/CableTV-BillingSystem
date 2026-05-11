import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

import { RootState, store, persistor } from './redux/store';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from './components/ProtectedRoute';

import { Layout } from '@/components/Layout';

import { ThemeProvider } from '@/components/ThemeProvider';

import { TooltipProvider } from '@/components/ui/tooltip';

import { Toaster } from '@/components/ui/toaster';

import { Toaster as Sonner } from 'sonner';

// ---------------- PAGES ----------------
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

// OPTIONAL NEW PAGES
import ProfilePage from './pages/ProfilePage';

// import SettingsPage from './pages/settings';

// import ContactPage from './pages/ContactPage';

// ---------------- QUERY CLIENT ----------------
const queryClient = new QueryClient();

// ---------------- ROUTES ----------------
export const AppRoutes = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <Routes>
      {/* ---------------- PUBLIC ---------------- */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* ---------------- PROTECTED ---------------- */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Customers */}
        <Route path="add-customer" element={<AddCustomer />} />

        <Route path="customers" element={<Customers />} />

        <Route path="customers/:id" element={<CustomerDetails />} />

        {/* Products */}
        <Route path="products" element={<Products />} />

        {/* Agents */}
        <Route path="agents" element={<Agents />} />

        {/* Expenses */}
        <Route path="expenses" element={<Expenses />} />

        {/* Collection */}
        <Route path="collection" element={<CollectionDashboard />} />

        {/* Profile */}
        <Route path="profilepage" element={<ProfilePage />} />

        {/* Settings */}
        {/* <Route path="settings" element={<SettingsPage />} /> */}

        {/* Contact */}
        {/* <Route path="contact" element={<ContactPage />} /> */}

        {/* Reports */}
        <Route
          path="reports"
          element={
            <div className="p-8 text-center text-slate-500">
              Reports module coming soon...
            </div>
          }
        />

        {/* Complaints */}
        <Route
          path="complaints"
          element={
            <div className="p-8 text-center text-slate-500">
              Complaints module coming soon...
            </div>
          }
        />
      </Route>

      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ---------------- MAIN APP ----------------
const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
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
    </PersistGate>
  </Provider>
);

export default App;
