
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Products from "./pages/Products";
import Agents from "./pages/Agents";
import Expenses from "./pages/Expenses";
import Collection from "./pages/Collection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="cabletv-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/products" element={<Products />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/reports" element={<div className="p-8 text-center text-slate-500">Reports module coming soon...</div>} />
              <Route path="/complaints" element={<div className="p-8 text-center text-slate-500">Complaints module coming soon...</div>} />
              <Route path="/settings" element={<div className="p-8 text-center text-slate-500">Settings module coming soon...</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
