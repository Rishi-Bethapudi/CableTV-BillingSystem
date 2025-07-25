// src/utils/apiService.ts
import apiClient from './apiClient'; // Import our central axios instance

// --- Type Definitions for Clarity ---

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface Customer {
  _id: string;
  name: string;
  // ... other customer fields
}

interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  // ... any other filter params your backend supports
}

interface PaginatedCustomersResponse {
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


// --- Authentication Service ---

/**
 * Logs in a user.
 * Note: This call uses a separate, direct axios/fetch call because it *initializes* the auth state.
 * The global apiClient interceptor relies on an existing auth state.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The login response data.
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  // This initial login call can be a direct fetch or axios call
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
      throw new Error(data.message || 'Login failed');
  }
  return data;
};


// --- Customer Services ---

/**
 * Fetches a paginated and filtered list of customers.
 * @param params - The query parameters for filtering and pagination.
 * @returns A paginated list of customers.
 */
// export const getCustomers = async (params: GetCustomersParams): Promise<PaginatedCustomersResponse> => {
//   const response = await apiClient.get('/customers', { params });
//   return response.data;
// };

/**
 * Fetches a single customer by their ID.
 * @param id - The ID of the customer.
 * @returns A single customer object.
 */
export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

/**
 * Creates a new customer.
 * @param customerData - The data for the new customer.
 * @returns The newly created customer object.
 */
export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.post('/customers', customerData);
  return response.data;
};

/**
 * Updates an existing customer.
 * @param id - The ID of the customer to update.
 * @param customerData - The updated data.
 * @returns The updated customer object.
 */
export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.put(`/customers/${id}`, customerData);
  return response.data;
};

/**
 * Deletes a customer.
 * @param id - The ID of the customer to delete.
 */
export const deleteCustomer = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
};


// --- Specialized Customer Services ---

/**
 * Imports customers from an Excel file.
 * @param file - The Excel file to upload.
 * @returns A success message.
 */
export const importCustomers = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/customers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Exports all customers to an Excel file.
 * This function handles the file download.
 */
export const exportCustomers = async (): Promise<void> => {
  const response = await apiClient.get('/customers/export', {
    responseType: 'blob', // Important: tells axios to handle the response as a file blob
  });

  // Create a URL for the blob and trigger a download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
