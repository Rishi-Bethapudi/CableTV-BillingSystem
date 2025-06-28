
import { Card, CardContent } from '@/components/ui/card';

interface CollectionSummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
}

export function CollectionSummaryCard({ title, amount, currency = '₹' }: CollectionSummaryCardProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6 text-center">
        <div className="text-3xl font-bold text-orange-500 mb-2">
          {currency} {amount.toLocaleString()}
        </div>
        <div className="text-gray-600 font-medium">
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
