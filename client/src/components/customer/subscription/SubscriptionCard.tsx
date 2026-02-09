import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  subscription: any;
  isSelected: boolean;
  onSelect: () => void;
}

const SubscriptionCard = ({ subscription, isSelected, onSelect }: Props) => {
  const { productId, startDate, expiryDate, status } = subscription;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'border rounded-lg p-3 cursor-pointer transition',
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300',
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">{productId?.name}</div>
          <div className="text-xs text-gray-500">
            {new Date(startDate).toLocaleDateString()} →{' '}
            {new Date(expiryDate).toLocaleDateString()}
          </div>
        </div>

        <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>
          {status}
        </Badge>
      </div>
    </div>
  );
};

export default SubscriptionCard;
