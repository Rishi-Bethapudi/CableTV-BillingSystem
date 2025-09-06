// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

// --- Page Imports ---
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Agents from './pages/Agents';
import Expenses from './pages/Expenses';
import Collection from './pages/Collection';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected Routes */}
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
        path="/add-customer"
        element={
          <ProtectedRoute>
            <Layout>
              <AddCustomer />
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
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

// src/App.tsx
// import { Toaster } from '@/components/ui/toaster';
// import { Toaster as Sonner } from '@/components/ui/sonner';
// import { TooltipProvider } from '@/components/ui/tooltip';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider } from '@/components/ThemeProvider';
// import { Layout } from '@/components/Layout';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import { useSelector } from 'react-redux';
// import { RootState } from './redux/store';

// // --- Page Imports ---
// import Dashboard from './pages/Dashboard';
// import Customers from './pages/Customers';
// import CustomerDetails from './pages/CustomerDetails';
// import Products from './pages/Products';
// import Agents from './pages/Agents';
// import Expenses from './pages/Expenses';
// import Collection from './pages/Collection';
// import NotFound from './pages/NotFound';
// import LoginPage from './pages/LoginPage';

// // Toggle this flag to enable or disable protection globally
// const ENABLE_PROTECTION = false;

// const queryClient = new QueryClient();

// const AppRoutes = () => {
//   const isAuthenticated = useSelector(
//     (state: RootState) => state.auth.isAuthenticated
//   );

//   const wrapWithProtection = (element: JSX.Element) =>
//     ENABLE_PROTECTION ? <ProtectedRoute>{element}</ProtectedRoute> : element;

//   const wrapWithLayout = (page: JSX.Element) => <Layout>{page}</Layout>;

//   return (
//     <Routes>
//       {/* Login Route */}
//       <Route
//         path="/login"
//         element={
//           ENABLE_PROTECTION && isAuthenticated ? (
//             <Navigate to="/" replace />
//           ) : (
//             <LoginPage />
//           )
//         }
//       />

//       {/* Core Routes */}
//       <Route
//         path="/"
//         element={wrapWithProtection(wrapWithLayout(<Dashboard />))}
//       />
//       <Route
//         path="/customers"
//         element={wrapWithProtection(wrapWithLayout(<Customers />))}
//       />
//       <Route
//         path="/customers/:id"
//         element={wrapWithProtection(wrapWithLayout(<CustomerDetails />))}
//       />
//       <Route
//         path="/products"
//         element={wrapWithProtection(wrapWithLayout(<Products />))}
//       />
//       <Route
//         path="/agents"
//         element={wrapWithProtection(wrapWithLayout(<Agents />))}
//       />
//       <Route
//         path="/expenses"
//         element={wrapWithProtection(wrapWithLayout(<Expenses />))}
//       />
//       <Route
//         path="/collection"
//         element={wrapWithProtection(wrapWithLayout(<Collection />))}
//       />

//       {/* Placeholder Routes */}
//       <Route
//         path="/reports"
//         element={wrapWithProtection(
//           wrapWithLayout(
//             <div className="p-8 text-center text-slate-500">
//               Reports module coming soon...
//             </div>
//           )
//         )}
//       />
//       <Route
//         path="/complaints"
//         element={wrapWithProtection(
//           wrapWithLayout(
//             <div className="p-8 text-center text-slate-500">
//               Complaints module coming soon...
//             </div>
//           )
//         )}
//       />
//       <Route
//         path="/settings"
//         element={wrapWithProtection(
//           wrapWithLayout(
//             <div className="p-8 text-center text-slate-500">
//               Settings module coming soon...
//             </div>
//           )
//         )}
//       />

//       {/* 404 Route */}
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <ThemeProvider defaultTheme="light" storageKey="cabletv-theme">
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           <AppRoutes />
//         </BrowserRouter>
//       </TooltipProvider>
//     </ThemeProvider>
//   </QueryClientProvider>
// );

// export default App;
