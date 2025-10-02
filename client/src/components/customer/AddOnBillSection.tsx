import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/utils/apiClient';
import type { Customer as CustomerData, Product } from '@/utils/data';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddOnBillSectionProps {
  customer: CustomerData;
  isVisible?: boolean;
  onRefresh: () => void;
}

export default function AddOnBillSection({
  customer,
  isVisible = true,
  onRefresh,
}: AddOnBillSectionProps) {
  const [packages, setPackages] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [isPriceModified, setIsPriceModified] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/products');
        const data = res.data;
        setPackages(data);

        if (data.length > 0) {
          setSelectedPackage(data[0]);
          setSearchTerm(data[0].name);
          setPrice(data[0].customerPrice.toString());
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Update price when package changes (only if user hasn't manually modified it)
  useEffect(() => {
    if (selectedPackage && !isPriceModified) {
      setPrice(selectedPackage.customerPrice.toString());
    }
  }, [selectedPackage, isPriceModified]);

  // Track if user manually modifies the price
  const handlePriceChange = (value: string) => {
    setPrice(value);
    setIsPriceModified(true);
  };
  const handleRemarkChange = (value: string) => {
    setNote(value);
  };
  // Reset price modification flag when package changes
  const handlePackageSelect = (pkg: Product) => {
    setSelectedPackage(pkg);
    setSearchTerm(pkg.name);
    setIsPriceModified(false); // Reset flag when package changes
    setOpen(false);
  };

  // Mutation to add addon
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedPackage || !price) {
        throw new Error('Please select a product and enter a price');
      }

      const payload = {
        customerId: customer._id,
        productId: selectedPackage._id,
        amount: parseInt(price, 10),
        note,
      };

      const res = await apiClient.post('/transactions/billing', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Add-on added successfully');
      setSelectedPackage(null);
      setSearchTerm('');
      setPrice('');
      setIsPriceModified(false);
      onRefresh();
    },
    onError: (err: any) => {
      console.error('Add-on error:', err);
      toast.error(
        err?.response?.data?.message || err.message || 'Something went wrong'
      );
    },
  });

  if (!isVisible) return null;

  const newBalance = customer.balanceAmount + (price ? parseInt(price, 10) : 0);

  return (
    <Card className="w-96">
      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
        <CardTitle className="text-lg">Add On Bill</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Current balance */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Balance
          </div>
          <div className="text-2xl font-bold">₹{customer.balanceAmount}</div>
        </div>

        {/* Product selector with shadcn/ui combobox */}
        {/* Product selector with improved UI */}
        <div className="space-y-2">
          <Label>Select Add-on</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-left"
              >
                {selectedPackage ? (
                  <div className="flex items-center justify-between w-full">
                    <span>{selectedPackage.name}</span>
                    <span className="text-sm text-gray-500">
                      ₹{selectedPackage.customerPrice}
                    </span>
                  </div>
                ) : (
                  'Select product...'
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search product..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {packages
                    .filter((pkg) =>
                      pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((pkg) => (
                      <CommandItem
                        key={pkg._id}
                        value={pkg.name}
                        onSelect={() => handlePackageSelect(pkg)}
                        className="flex justify-between items-center px-3 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                      >
                        <span className="flex items-center gap-2">
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedPackage?._id === pkg._id
                                ? 'opacity-100 text-yellow-600'
                                : 'opacity-0'
                            )}
                          />
                          {pkg.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ₹{pkg.customerPrice}
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Price with sync indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="price">Price</Label>
            {isPriceModified && (
              <span className="text-xs text-muted-foreground">
                Custom price
              </span>
            )}
          </div>
          <Input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={isPriceModified ? 'border-amber-500' : ''}
          />
          {!isPriceModified && selectedPackage && (
            <p className="text-xs text-muted-foreground">
              Auto-synced with selected package
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="remark">Remarks</Label>
          </div>
          <Input
            id="remark"
            type="string"
            placeholder="Any Remarks..."
            value={note}
            onChange={(e) => handleRemarkChange(e.target.value)}
            className={isPriceModified ? 'border-amber-500' : ''}
          />
        </div>

        {/* New Balance */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              New Balance:
            </span>
            <span className="font-bold text-lg">₹{newBalance}</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={() => mutate()}
          disabled={isPending || loading || !selectedPackage || !price}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isPending ? 'Adding...' : 'Add to Bill'}
        </Button>
      </CardContent>
    </Card>
  );
}
