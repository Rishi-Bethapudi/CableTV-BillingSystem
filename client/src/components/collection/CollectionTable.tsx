
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface CollectionData {
  date: string;
  customer: string;
  amount: number;
  discount: number;
  totalPayment: number;
  customerDetails: {
    name: string;
    area: string;
    previousBalance: number;
    paidAmount: number;
    discount: number;
    currentBalance: number;
    collectedBy: string;
    customerCode: string;
    subNo: string;
    cardNo: string;
  }[];
}

const mockCollectionData: CollectionData[] = [
  {
    date: '14-Jun-2025',
    customer: '2',
    amount: 700,
    discount: 0,
    totalPayment: 700,
    customerDetails: [
      {
        name: 'Chenna Kesavulu G',
        area: 'OBKVP',
        previousBalance: 350,
        paidAmount: 350,
        discount: 0,
        currentBalance: 0,
        collectedBy: 'MAHI COMMUNICATIONS',
        customerCode: '200270839',
        subNo: 'DSNW20227c40',
        cardNo: 'KK070518'
      },
      {
        name: 'Venkatayananna Podapala',
        area: 'Kandrapadu',
        previousBalance: 300,
        paidAmount: 350,
        discount: 0,
        currentBalance: -50,
        collectedBy: 'MAHI COMMUNICATIONS',
        customerCode: '103628294',
        subNo: 'DSNW26484e88',
        cardNo: ''
      }
    ]
  },
  {
    date: '13-Jun-2025',
    customer: '12',
    amount: 5000,
    discount: 0,
    totalPayment: 5000,
    customerDetails: [
      {
        name: 'Rani Mamidi',
        area: 'Kandrapadu',
        previousBalance: 350,
        paidAmount: 350,
        discount: 0,
        currentBalance: 0,
        collectedBy: 'MAHI COMMUNICATIONS',
        customerCode: '103329925',
        subNo: 'DSNW2647a418',
        cardNo: 'MK4RRRC'
      },
      {
        name: 'Rajasekhar Reddy Mangunuru',
        area: 'Kandrapadu',
        previousBalance: 650,
        paidAmount: 650,
        discount: 0,
        currentBalance: 0,
        collectedBy: 'MAHI COMMUNICATIONS',
        customerCode: '43659',
        subNo: 'ZTE6CFA7EBBA',
        cardNo: ''
      }
    ]
  }
];

export function CollectionTable() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRowExpansion = (date: string) => {
    setExpandedRows(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Summary</h3>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Excel
        </Button>
      </div>

      {mockCollectionData.map((dayData) => (
        <Card key={dayData.date} className="overflow-hidden">
          <div className="bg-slate-700 text-white px-4 py-2 text-center font-medium">
            {dayData.date}
          </div>
          
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRowExpansion(dayData.date)}
                >
                  <TableCell>{dayData.customer}</TableCell>
                  <TableCell>₹ {dayData.amount}</TableCell>
                  <TableCell>₹ {dayData.discount}</TableCell>
                  <TableCell>₹ {dayData.totalPayment}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {expandedRows.includes(dayData.date) && (
              <div className="border-t bg-gray-50 p-4">
                <h4 className="font-medium mb-3">Customer Details</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Previous Balance</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Current Balance</TableHead>
                        <TableHead>Collected By</TableHead>
                        <TableHead>Customer Code</TableHead>
                        <TableHead>Sub no</TableHead>
                        <TableHead>Card No</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayData.customerDetails.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.area}</TableCell>
                          <TableCell>₹ {customer.previousBalance}</TableCell>
                          <TableCell>₹ {customer.paidAmount}</TableCell>
                          <TableCell>₹ {customer.discount}</TableCell>
                          <TableCell>₹ {customer.currentBalance}</TableCell>
                          <TableCell>{customer.collectedBy}</TableCell>
                          <TableCell>{customer.customerCode}</TableCell>
                          <TableCell>{customer.subNo}</TableCell>
                          <TableCell>{customer.cardNo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
