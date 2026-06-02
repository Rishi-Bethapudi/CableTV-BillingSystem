// services/agent.service.ts
import apiClient from '@/utils/apiClient';

export interface Agent {
  _id: string;
  name: string;
  email?: string;
  mobile: string;
  employeeCode?: string;
  role: string;
  status: 'active' | 'suspended' | 'inactive';
  online?: boolean;
  address?: string;
  joinedDate?: string;
  lastLogin?: string;
  lastCollection?: string;
  createdAt?: string;
  permissions: string[];
  assignedAreas: string[];
  areas?: string[]; // For backward compatibility
}

export interface AgentStats {
  totalCollections: number;
  todayCollections: number;
  monthCollections: number;
  pendingCollections?: number;
  avgDailyCollections?: number;
  totalCustomers: number;
  totalAmountCollected: number;
  todayAmount: number;
  monthAmount: number;
}

export interface RecentTransaction {
  _id: string;
  amount: number;
  customerName: string;
  date: string;
  transactionId?: string;
  mode?: string;
  status?: string;
}

export interface AgentDetailsResponse {
  agent: Agent;
  stats: AgentStats;
  recentTransactions: RecentTransaction[];
}

// Query keys for caching
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: any) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  stats: (id: string) => [...agentKeys.detail(id), 'stats'] as const,
  transactions: (id: string) => [...agentKeys.detail(id), 'transactions'] as const,
};

// API functions
export const agentApi = {
  getAgentById: async (id: string): Promise<AgentDetailsResponse> => {
    const response = await apiClient.get(`/operators/agents/${id}`);
    return response.data;
  },

  updateAgent: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
    const response = await apiClient.patch(`/operators/agents/${id}`, data);
    return response.data;
  },

  updatePermissions: async ({ id, permissions }: { id: string; permissions: string[] }) => {
    const response = await apiClient.patch(`/operators/agents/${id}/permissions`, {
      permissions,
    });
    return response.data;
  },

  updateAreas: async ({ id, areas }: { id: string; areas: string[] }) => {
    const response = await apiClient.patch(`/operators/agents/${id}/areas`, {
      assignedAreas: areas,
    });
    return response.data;
  },

  updateStatus: async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
    const response = await apiClient.patch(`/operators/agents/${id}/status`, {
      status,
    });
    return response.data;
  },

  resetPassword: async (id: string) => {
    const response = await apiClient.post(`/operators/agents/${id}/reset-password`);
    return response.data;
  },

  impersonate: async (id: string) => {
    const response = await apiClient.post(`/operators/agents/${id}/impersonate`);
    return response.data;
  },

  forceLogout: async (id: string) => {
    const response = await apiClient.post(`/operators/agents/${id}/force-logout`);
    return response.data;
  },

  deleteAgent: async (id: string) => {
    const response = await apiClient.delete(`/operators/agents/${id}`);
    return response.data;
  },
};