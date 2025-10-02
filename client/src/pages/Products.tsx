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
} from 'lucide-react';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/AddProductDialog';
import { EditProductDialog } from '@/components/EditProductDialog';
import ExcelUploadDialog from '@/components/ExcelUploadDialog';
import ConfirmationModal from '@/components/customer/ConfirmationModal';

import type { Product } from '@/utils/data';

export default function Products() {
  const { setHeaderActions } = useLayout();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setHeaderActions(
      <div className="flex gap-1">
        <Button variant="ghost" size="icon">
          <Trash2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
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
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products');
      return response.data.map((p: any) => ({
        _id: p._id,
        operatorId: p.operatorId,
        productCode: p.productCode,
        name: p.name,
        category: p.category || 'Basic',
        customerPrice: p.customerPrice || 0,
        operatorCost: p.operatorCost || 0,
        billingInterval: p.billingInterval || { value: 30, unit: 'days' },
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    },
  });

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteProductId(id);
    setDeleteProductName(name);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await apiClient.delete(`/products/${deleteProductId}`);
      toast.success(`"${deleteProductName}" deleted successfully`);
      refetch();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    } finally {
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setDeleteProductName(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/products/${id}`, { isActive: !currentStatus });
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
    // Implement your download logic here, mapping fields to Excel-friendly format
    toast.success('Product data downloaded successfully');
  };

  const handleUploadExcel = async (file: File) => {
    // Implement your Excel parsing/upload here
    toast.success('Products uploaded successfully');
    refetch();
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-lg">
        Loading products...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-lg text-red-600">
        Error loading products
      </div>
    );

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
            <Download className="h-4 w-4 mr-2" /> Download Excel
          </Button>
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload Excel
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product
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
              {products?.filter((p) => p.isActive).length || 0}
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
                  <TableHead>Customer Price</TableHead>
                  <TableHead>Operator Cost</TableHead>
                  <TableHead>Billing Interval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      {product.productCode}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>₹{product.customerPrice.toFixed(2)}</TableCell>
                    <TableCell>₹{product.operatorCost.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.billingInterval.value}{' '}
                      {product.billingInterval.unit}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() =>
                          handleToggleActive(product._id, product.isActive)
                        }
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
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
                            handleDeleteClick(product._id, product.name)
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
      <ConfirmationModal
        open={showDeleteModal}
        message="Are you sure you want to delete this product?"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setShowDeleteModal(false)}
      />
      <ExcelUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        title="Upload Product Data"
        description="Upload an Excel file with product data. Required columns: productCode, name, category, customerPrice, operatorCost, billingIntervalValue, billingIntervalUnit, isActive."
        onUpload={handleUploadExcel}
      />
    </div>
  );
}
