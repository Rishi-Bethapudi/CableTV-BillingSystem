
import * as XLSX from 'xlsx';

export interface CustomerExcelData {
  customer_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  connection_date: string;
}

export interface ProductExcelData {
  product_code: string;
  name: string;
  description: string;
  category: string;
  monthly_price: number;
  installation_fee: number;
  is_active: boolean;
}

export const downloadCustomersToExcel = (customers: any[], filename = 'customers.xlsx') => {
  const excelData: CustomerExcelData[] = customers.map(customer => ({
    customer_code: customer.customer_code,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    status: customer.status,
    connection_date: customer.connection_date
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, filename);
};

export const downloadProductsToExcel = (products: any[], filename = 'products.xlsx') => {
  const excelData: ProductExcelData[] = products.map(product => ({
    product_code: product.product_code,
    name: product.name,
    description: product.description || '',
    category: product.category,
    monthly_price: product.monthly_price,
    installation_fee: product.installation_fee || 0,
    is_active: product.is_active
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filename);
};

export const parseCustomersFromExcel = (file: File): Promise<CustomerExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as CustomerExcelData[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const parseProductsFromExcel = (file: File): Promise<ProductExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ProductExcelData[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
