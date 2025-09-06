import { useState } from 'react';
import { CollectionSummaryCard } from '@/components/collection/CollectionSummaryCard';
import { CollectionFilters } from '@/components/collection/CollectionFilters';
import { CollectionTable } from '@/components/collection/CollectionTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function Collection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Collection</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-center">
            Payment will be credited to your bank account within 2 bank working
            days
          </p>
        </div>
      </div>

      {/* Filters */}
      <CollectionFilters />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CollectionSummaryCard title="Total Paid" amount={33950} />
        <CollectionSummaryCard title="Total Payments" amount={33950} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="online-transactions">
            Online Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <CollectionTable />
        </TabsContent>

        <TabsContent value="online-transactions" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Online transactions data will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
