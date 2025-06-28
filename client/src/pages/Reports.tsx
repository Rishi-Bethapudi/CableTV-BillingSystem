
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Users, Package, Receipt, CreditCard, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCustomersToExcel, downloadProductsToExcel } from '@/utils/excelUtils';

export default function Reports() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Fetch customers data
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products data
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch agents data
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch expenses data
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (type: string, data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error(`No ${type} data available to download`);
      return;
    }

    try {
      setIsDownloading(type);
      
      if (type === 'customers') {
        downloadCustomersToExcel(data, filename);
      } else if (type === 'products') {
        downloadProductsToExcel(data, filename);
      } else {
        // Generic Excel download for other data types
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));
        XLSX.writeFile(workbook, filename);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      toast.error(`Failed to download ${type} data`);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadOptions = [
    {
      id: 'customers',
      title: 'Customer List',
      description: 'Download complete customer database',
      icon: Users,
      data: customers,
      filename: 'customers_report.xlsx',
      count: customers?.length || 0,
      category: 'Customer Reports'
    },
    {
      id: 'active-customers',
      title: 'Active Customers',
      description: 'Download active customers only',
      icon: Users,
      data: customers?.filter(c => c.status === 'active'),
      filename: 'active_customers_report.xlsx',
      count: customers?.filter(c => c.status === 'active').length || 0,
      category: 'Customer Reports'
    },
    {
      id: 'products',
      title: 'Product List',
      description: 'Download complete product catalog',
      icon: Package,
      data: products,
      filename: 'products_report.xlsx',
      count: products?.length || 0,
      category: 'Product Reports'
    },
    {
      id: 'active-products',
      title: 'Active Products',
      description: 'Download active products only',
      icon: Package,
      data: products?.filter(p => p.is_active),
      filename: 'active_products_report.xlsx',
      count: products?.filter(p => p.is_active).length || 0,
      category: 'Product Reports'
    },
    {
      id: 'agents',
      title: 'Agent List',
      description: 'Download all agents data',
      icon: UserCheck,
      data: agents,
      filename: 'agents_report.xlsx',
      count: agents?.length || 0,
      category: 'Agent Reports'
    },
    {
      id: 'expenses',
      title: 'All Expenses',
      description: 'Download complete expense report',
      icon: Receipt,
      data: expenses,
      filename: 'expenses_report.xlsx',
      count: expenses?.length || 0,
      category: 'Financial Reports'
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      description: 'Download current month expenses',
      icon: Receipt,
      data: expenses?.filter(e => {
        const date = new Date(e.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }),
      filename: 'monthly_expenses_report.xlsx',
      count: expenses?.filter(e => {
        const date = new Date(e.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length || 0,
      category: 'Financial Reports'
    }
  ];

  // Group download options by category
  const groupedOptions = downloadOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof downloadOptions>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and download reports for your business data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {customers?.filter(c => c.status === 'active').length || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {products?.filter(p => p.is_active).length || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expenses?.reduce((sum, expense) => sum + expense.amount, 0)?.toLocaleString('en-IN') || 0}</div>
            <p className="text-xs text-muted-foreground">
              {expenses?.length || 0} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Downloads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Downloads
          </CardTitle>
          <CardDescription>
            Download various reports and data exports in Excel format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedOptions).map(([category, options]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{category}</h3>
                <Badge variant="secondary">{options.length} reports</Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {options.map((option) => {
                  const Icon = option.icon;
                  const isCurrentlyDownloading = isDownloading === option.id;
                  const hasData = option.data && option.data.length > 0;
                  
                  return (
                    <Card key={option.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <Badge variant={hasData ? "default" : "secondary"}>
                            {option.count} records
                          </Badge>
                        </div>
                        <CardTitle className="text-sm">{option.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {option.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          onClick={() => handleDownload(option.id, option.data || [], option.filename)}
                          disabled={!hasData || isCurrentlyDownloading}
                          size="sm"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isCurrentlyDownloading ? 'Downloading...' : 'Download Excel'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {category !== Object.keys(groupedOptions)[Object.keys(groupedOptions).length - 1] && (
                <Separator />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
