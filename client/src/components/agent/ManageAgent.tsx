// ManageAgent.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from './AgentHeader';
import { CollectionPerformanceCard } from './AgentPerformance';
import { AssignedAreasCard, PermissionsCard } from './AgentAssigned';
import { DangerZoneCard } from './AgentActions';
import { EditProfileModal, ConfirmDialog } from './AgentDialogs';
import { useToast, ToastContainer } from '../Atoms';
import apiClient from '@/utils/apiClient';
import { Loader2 } from 'lucide-react';

interface Agent {
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
  areas: string[];
}

interface AgentStats {
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

interface RecentTransaction {
  _id: string;
  amount: number;
  customerName: string;
  date: string;
  // Add other transaction fields as needed
}

interface AgentResponse {
  agent: Agent;
  stats: AgentStats;
  recentTransactions: RecentTransaction[];
}

export default function ManageAgent() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmLoginAs, setConfirmLoginAs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmForceLogout, setConfirmForceLogout] = useState(false);
  const [confirmResetPassword, setConfirmResetPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setError('No agent ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Use the correct endpoint from your routes
      const response = await apiClient.get(`/operators/agents/${agentId}`);

      // Extract data from the response structure
      const {
        agent: agentData,
        stats: agentStats,
        recentTransactions: transactions,
      } = response.data;

      setAgent({
        ...agentData,
        id: agentData._id,
        online: agentData.online || false,
        permissions: agentData.permissions || [],
        areas: agentData.areas || [],
      });

      setStats(agentStats);
      setRecentTransactions(transactions || []);
    } catch (error: any) {
      console.error('FETCH AGENT ERROR:', error);
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch agent details';
      setError(errorMessage);
      toast(errorMessage, 'error');

      // If agent not found, redirect back after 2 seconds
      if (error?.response?.status === 404) {
        setTimeout(() => navigate('/operators/agents'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [agentId, navigate, toast]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const handleEdit = useCallback(
    async (data: Partial<Agent>) => {
      if (!agent) return;

      try {
        setActionLoading(true);
        // Use PATCH instead of PUT based on your routes
        const response = await apiClient.patch(
          `/operators/agents/${agent._id}`,
          data,
        );
        const updatedAgent = response.data.agent || response.data;

        setAgent((prev) => (prev ? { ...prev, ...updatedAgent } : null));
        toast('Profile updated successfully', 'success');
        setEditOpen(false);
      } catch (error: any) {
        console.error('UPDATE AGENT ERROR:', error);
        toast(
          error?.response?.data?.message || 'Failed to update profile',
          'error',
        );
      } finally {
        setActionLoading(false);
      }
    },
    [agent, toast],
  );

  const handlePermissionsSave = useCallback(
    async (permissions: string[]) => {
      if (!agent) return;

      try {
        setActionLoading(true);
        // Use PATCH for permissions update
        const response = await apiClient.patch(
          `/operators/agents/${agent._id}/permissions`,
          {
            permissions,
          },
        );

        const updatedAgent = response.data.agent || response.data;
        setAgent((prev) =>
          prev
            ? { ...prev, permissions: updatedAgent.permissions || permissions }
            : null,
        );
        toast('Permissions saved successfully', 'success');
      } catch (error: any) {
        console.error('SAVE PERMISSIONS ERROR:', error);
        toast(
          error?.response?.data?.message || 'Failed to save permissions',
          'error',
        );
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [agent, toast],
  );

  const handleAreasSave = useCallback(
    async (areas: string[]) => {
      if (!agent) return;
      if (actionLoading) return;

      try {
        setActionLoading(true);
        const response = await apiClient.patch(
          `/operators/agents/${agent._id}/areas`,
          {
            assignedAreas: areas,
          },
        );

        const updatedAgent = response.data.agent || response.data;
        setAgent((prev) =>
          prev
            ? { ...prev, assignedAreas: updatedAgent.assignedAreas || areas }
            : null,
        );
        toast('Areas updated successfully', 'success');
        return true; // Return success to child
      } catch (error: any) {
        console.error('SAVE AREAS ERROR:', error);
        toast(
          error?.response?.data?.message || 'Failed to update areas',
          'error',
        );
        throw error; // Throw error so child knows it failed
      } finally {
        setActionLoading(false);
      }
    },
    [agent, toast],
  );

  const handleToggleStatus = useCallback(
    async (newStatus: 'active' | 'suspended') => {
      if (!agent) return;

      try {
        setActionLoading(true);
        // Use PATCH for status update
        const response = await apiClient.patch(
          `/operators/agents/${agent._id}/status`,
          {
            status: newStatus,
          },
        );

        const updatedAgent = response.data.agent || response.data;
        setAgent((prev) =>
          prev ? { ...prev, status: updatedAgent.status || newStatus } : null,
        );
        toast(
          newStatus === 'active'
            ? 'Agent activated successfully'
            : 'Agent suspended successfully',
          newStatus === 'active' ? 'success' : 'warning',
        );
      } catch (error: any) {
        console.error('TOGGLE STATUS ERROR:', error);
        toast(
          error?.response?.data?.message || 'Failed to update agent status',
          'error',
        );
      } finally {
        setActionLoading(false);
      }
    },
    [agent, toast],
  );

  const handleLoginAs = useCallback(async () => {
    if (!agent) return;

    try {
      setActionLoading(true);
      // Use the impersonate endpoint from your routes
      const response = await apiClient.post(
        `/operators/agents/${agent._id}/impersonate`,
      );

      // Store the impersonation token and redirect
      const { token, redirectUrl, agentSession } = response.data;

      if (token) {
        localStorage.setItem('impersonationToken', token);
        localStorage.setItem('originalUser', 'true');
        localStorage.setItem('agentId', agent._id);
      }

      toast('Logged in as agent — opening agent dashboard', 'success');
      setConfirmLoginAs(false);

      // Redirect to agent dashboard or the provided URL
      window.location.href = redirectUrl || '/agent/dashboard';
    } catch (error: any) {
      console.error('LOGIN AS AGENT ERROR:', error);
      toast(
        error?.response?.data?.message || 'Failed to login as agent',
        'error',
      );
      setConfirmLoginAs(false);
    } finally {
      setActionLoading(false);
    }
  }, [agent, toast]);

  const handleResetPassword = useCallback(async () => {
    if (!agent) return;

    try {
      setActionLoading(true);
      await apiClient.post(`/operators/agents/${agent._id}/reset-password`);

      toast(
        'Password reset successfully. An email has been sent to the agent.',
        'success',
      );
      setConfirmResetPassword(false);
    } catch (error: any) {
      console.error('RESET PASSWORD ERROR:', error);
      toast(
        error?.response?.data?.message || 'Failed to reset password',
        'error',
      );
    } finally {
      setActionLoading(false);
    }
  }, [agent, toast]);

  const handleForceLogout = useCallback(async () => {
    if (!agent) return;

    try {
      setActionLoading(true);
      // You may need to create this endpoint if not exists
      await apiClient.post(`/operators/agents/${agent._id}/force-logout`);

      setAgent((prev) => (prev ? { ...prev, online: false } : null));
      toast('Agent forcefully logged out', 'warning');
      setConfirmForceLogout(false);
    } catch (error: any) {
      console.error('FORCE LOGOUT ERROR:', error);
      toast(
        error?.response?.data?.message || 'Failed to force logout',
        'error',
      );
    } finally {
      setActionLoading(false);
    }
  }, [agent, toast]);

  const handleDelete = useCallback(async () => {
    if (!agent) return;

    try {
      setActionLoading(true);
      await apiClient.delete(`/operators/agents/${agent._id}`);

      toast('Agent deleted successfully', 'info');
      setConfirmDelete(false);

      // Redirect to agents list after deletion
      setTimeout(() => navigate('/operators/agents'), 1500);
    } catch (error: any) {
      console.error('DELETE AGENT ERROR:', error);
      toast(
        error?.response?.data?.message || 'Failed to delete agent',
        'error',
      );
    } finally {
      setActionLoading(false);
    }
  }, [agent, navigate, toast]);

  // Prepare agent object with stats for child components
  const agentWithStats = agent
    ? {
        ...agent,
        stats: stats || {
          totalCollections: 0,
          todayCollections: 0,
          monthCollections: 0,
          pendingCollections: 0,
          avgDailyCollections: 0,
          totalCustomers: 0,
          totalAmountCollected: 0,
          todayAmount: 0,
          monthAmount: 0,
        },
        recentTransactions,
      }
    : null;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>

            {/* Two Column Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="h-96 bg-muted rounded-lg animate-pulse" />
              <div className="h-96 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Performance Skeleton */}
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !agentWithStats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-semibold text-gray-700">
            Agent Not Found
          </h2>
          <p className="text-gray-500">
            {error || 'Unable to load agent details'}
          </p>
          <button
            onClick={() => navigate('/operators/agents')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Agents List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        agent={agentWithStats}
        onEdit={() => setEditOpen(true)}
        onToggleStatus={handleToggleStatus}
        onLoginAs={() => setConfirmLoginAs(true)}
        onBack={() => navigate('/operators/agents')}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        {/* Two-column layout for Permissions and Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PermissionsCard
            agent={agentWithStats}
            onSave={handlePermissionsSave}
            disabled={actionLoading}
          />
          <AssignedAreasCard
            agent={agentWithStats}
            onSave={handleAreasSave}
            disabled={actionLoading}
          />
        </div>

        {/* Collection Performance */}
        <CollectionPerformanceCard agent={agentWithStats} />

        {/* Danger Zone / Account Management */}
        <DangerZoneCard
          agent={agentWithStats}
          onResetPassword={() => setConfirmResetPassword(true)}
          onForceLogout={() => setConfirmForceLogout(true)}
          onSuspend={() => handleToggleStatus('suspended')}
          onActivate={() => handleToggleStatus('active')}
          onDelete={() => setConfirmDelete(true)}
          disabled={actionLoading}
        />
      </div>

      {/* Modals */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        agent={agentWithStats}
        onSave={handleEdit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmLoginAs}
        onClose={() => setConfirmLoginAs(false)}
        onConfirm={handleLoginAs}
        title="Login as Agent"
        description={`You are about to login as ${agent.name}. You will be able to perform actions on their behalf.`}
        confirmText="Login"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmForceLogout}
        onClose={() => setConfirmForceLogout(false)}
        onConfirm={handleForceLogout}
        title="Force Logout"
        description={`Are you sure you want to force logout ${agent.name}? They will be immediately signed out.`}
        confirmText="Force Logout"
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmResetPassword}
        onClose={() => setConfirmResetPassword(false)}
        onConfirm={handleResetPassword}
        title="Reset Password"
        description={`Send a password reset email to ${agent.name}? They will receive instructions to set a new password.`}
        confirmText="Send Reset Email"
        variant="info"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Agent"
        description={`Are you sure you want to delete ${agent.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={actionLoading}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
