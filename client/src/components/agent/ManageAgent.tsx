// ManageAgent.tsx - Refactored with React Query
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from './AgentHeader';
import { CollectionPerformanceCard } from './AgentPerformance';
import { AssignedAreasCard, PermissionsCard } from './AgentAssigned';
import { DangerZoneCard } from './AgentActions';
import { EditProfileModal, ConfirmDialog } from './AgentDialogs';
import { ToastContainer } from '../Atoms';
import {
  useAgent,
  useUpdateAgent,
  useUpdatePermissions,
  useUpdateAreas,
  useUpdateAgentStatus,
  useResetPassword,
  useImpersonateAgent,
  useForceLogout,
  useDeleteAgent,
} from '@/hooks/useAgent';
import { Loader2 } from 'lucide-react';

export default function ManageAgent() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  // State for UI
  const [editOpen, setEditOpen] = useState(false);
  const [confirmLoginAs, setConfirmLoginAs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmForceLogout, setConfirmForceLogout] = useState(false);
  const [confirmResetPassword, setConfirmResetPassword] = useState(false);

  // React Query hooks
  const { data, isLoading, error, refetch } = useAgent(agentId);

  const updateAgent = useUpdateAgent();
  const updatePermissions = useUpdatePermissions();
  const updateAreas = useUpdateAreas();
  const updateStatus = useUpdateAgentStatus();
  const resetPassword = useResetPassword();
  const impersonate = useImpersonateAgent();
  const forceLogout = useForceLogout();
  const deleteAgent = useDeleteAgent();

  // Prepare agent with stats
  const agentWithStats = data
    ? {
        ...data.agent,
        stats: data.stats,
        recentTransactions: data.recentTransactions,
      }
    : null;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading agent details...</p>
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
            {error?.message || 'Unable to load agent details'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/operators/agents')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Agents List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        agent={agentWithStats}
        onEdit={() => setEditOpen(true)}
        onToggleStatus={(status) =>
          updateStatus.mutate({
            id: agentWithStats._id,
            status,
          })
        }
        onLoginAs={() => setConfirmLoginAs(true)}
        onBack={() => navigate('/operators/agents')}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PermissionsCard
            agent={agentWithStats}
            onSave={(permissions) =>
              updatePermissions.mutate({
                id: agentWithStats._id,
                permissions,
              })
            }
            disabled={updatePermissions.isPending}
          />
          <AssignedAreasCard
            agent={agentWithStats}
            onSave={(areas) =>
              updateAreas.mutate({
                id: agentWithStats._id,
                areas,
              })
            }
            disabled={updateAreas.isPending}
          />
        </div>

        <CollectionPerformanceCard agent={agentWithStats} />

        <DangerZoneCard
          agent={agentWithStats}
          onResetPassword={() => setConfirmResetPassword(true)}
          onForceLogout={() => setConfirmForceLogout(true)}
          onSuspend={() =>
            updateStatus.mutate({
              id: agentWithStats._id,
              status: 'suspended',
            })
          }
          onActivate={() =>
            updateStatus.mutate({
              id: agentWithStats._id,
              status: 'active',
            })
          }
          onDelete={() => setConfirmDelete(true)}
          disabled={updateStatus.isPending}
        />
      </div>

      {/* Modals */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        agent={agentWithStats}
        onSave={(data) =>
          updateAgent.mutate({
            id: agentWithStats._id,
            data,
          })
        }
        loading={updateAgent.isPending}
      />

      <ConfirmDialog
        open={confirmLoginAs}
        onClose={() => setConfirmLoginAs(false)}
        onConfirm={() => impersonate.mutate(agentWithStats._id)}
        title="Login as Agent"
        description={`You are about to login as ${agentWithStats.name}. You will be able to perform actions on their behalf.`}
        confirmText="Login"
        loading={impersonate.isPending}
      />

      <ConfirmDialog
        open={confirmForceLogout}
        onClose={() => setConfirmForceLogout(false)}
        onConfirm={() => forceLogout.mutate(agentWithStats._id)}
        title="Force Logout"
        description={`Are you sure you want to force logout ${agentWithStats.name}? They will be immediately signed out.`}
        confirmText="Force Logout"
        variant="warning"
        loading={forceLogout.isPending}
      />

      <ConfirmDialog
        open={confirmResetPassword}
        onClose={() => setConfirmResetPassword(false)}
        onConfirm={() => resetPassword.mutate(agentWithStats._id)}
        title="Reset Password"
        description={`Send a password reset email to ${agentWithStats.name}? They will receive instructions to set a new password.`}
        confirmText="Send Reset Email"
        variant="info"
        loading={resetPassword.isPending}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteAgent.mutate(agentWithStats._id, {
            onSuccess: () => {
              setTimeout(() => navigate('/operators/agents'), 1500);
            },
          });
        }}
        title="Delete Agent"
        description={`Are you sure you want to delete ${agentWithStats.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteAgent.isPending}
      />

      <ToastContainer toasts={[]} />
    </div>
  );
}
