import { useState, useEffect } from 'react';
import { useLayout } from '@/components/layouts/LayoutContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/AddProductDialog';
import { EditProductDialog } from '@/components/EditProductDialog';
import {
  downloadProductsToExcel,
  parseProductsFromExcel,
} from '@/utils/excelUtils';
import ExcelUploadDialog from '@/components/ExcelUploadDialog';

interface Product {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  monthly_price: number;
  installation_fee: number | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export default function Products() {
  const { setHeaderActions } = useLayout();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    setHeaderActions(
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <Trash className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    );
    return () => setHeaderActions(null);
  }, []);

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/products');
        const mappedProducts: Product[] = response.data.map((p: any) => ({
          id: p._id,
          product_code: p.productCode || p.product_code || '',
          name: p.name,
          description: p.description || null,
          monthly_price: p.customerPrice || 0,
          installation_fee: p.operatorCost || 0, // or another field if applicable
          category: p.category || 'Basic',
          is_active: p.isActive,
          created_at: p.createdAt,
        }));
        return mappedProducts;
      } catch (err: any) {
        console.error('Error fetching products:', err);
        throw err;
      }
    },
  });

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      refetch();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/products/${id}`, { is_active: !currentStatus });
      toast.success(
        `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
      refetch();
    } catch (err) {
      console.error('Error updating product status:', err);
      toast.error('Failed to update product status');
    }
  };

  const handleDownloadExcel = () => {
    if (!products || products.length === 0) {
      toast.error('No product data to download');
      return;
    }
    downloadProductsToExcel(products, 'products_export.xlsx');
    toast.success('Product data downloaded successfully');
  };

  const handleUploadExcel = async (file: File) => {
    try {
      const productData = await parseProductsFromExcel(file);

      // Insert each product via API
      for (const product of productData) {
        await apiClient.post('/products', {
          product_code: product.product_code,
          name: product.name,
          description: product.description || null,
          category: product.category,
          monthly_price: product.monthly_price,
          installation_fee: product.installation_fee || 0,
          is_active: product.is_active !== false,
        });
      }

      refetch();
      toast.success(`Successfully imported ${productData.length} products`);
    } catch (err) {
      console.error('Error uploading products:', err);
      toast.error('Failed to upload products');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading products</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Products & Packages
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your cable TV packages and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadExcel}>
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.filter((p) => p.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Basic Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.filter((p) => p.category === 'Basic').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Premium Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.filter((p) => p.category === 'Premium').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            View and manage all your cable TV packages and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Installation Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.product_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>₹{product.monthly_price.toFixed(2)}</TableCell>
                    <TableCell>
                      ₹{(product.installation_fee || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={() => {
            refetch();
            setEditingProduct(null);
          }}
        />
      )}

      <ExcelUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Upload Product Data"
        description="Upload an Excel file with product data. The file should contain columns: product_code, name, description, category, monthly_price, installation_fee, is_active."
        onUpload={handleUploadExcel}
      />
    </div>
  );
}
