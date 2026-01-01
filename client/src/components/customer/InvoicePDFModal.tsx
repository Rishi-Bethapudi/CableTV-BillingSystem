import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: string;
}

export default function InvoicePDFModal({
  open,
  onClose,
  transactionId,
}: Props) {
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('CapacitorStorage.accessToken');
  const pdfUrl = `${base}/transactions/${transactionId}/pdf?token=${token}`;
  console.log('PDF URL:', pdfUrl);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Download or print the invoice shown below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between p-3 border-b">
          <h2 className="font-semibold text-lg">Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={() => window.open(pdfUrl, '_blank')}>
              Download
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>

        <iframe
          src={pdfUrl}
          width="100%"
          height="650"
          className="rounded-b-md"
          style={{ border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
}
