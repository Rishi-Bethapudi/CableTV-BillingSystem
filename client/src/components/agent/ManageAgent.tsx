// ManageAgent.tsx
import { useState, useCallback } from 'react';
import { PageHeader } from './AgentHeader';
import { CollectionPerformanceCard } from './AgentPerformance';
import { AssignedAreasCard, PermissionsCard } from './AgentAssigned';
import { DangerZoneCard } from './AgentActions';
import { EditProfileModal } from './AgentDialogs';
import { useToast, ToastContainer } from '../Atoms';

// Mock agent data
const MOCK_AGENT = {
  id: 'AGT-0004',
  name: 'Ravi Kumar',
  email: 'ravi.kumar@mahicomm.in',
  mobile: '9441995758',
  employeeCode: 'EMP1001',
  role: 'collection_agent',
  status: 'active',
  online: true,
  address: 'Plot 14, Near Water Tank, Kandrapadu, Krishna Dist., AP - 521228',
  joinedDate: '2022-03-15T00:00:00Z',
  lastLogin: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  lastCollection: new Date(Date.now() - 2 * 3600000).toISOString(),
  createdAt: '2022-03-15T08:30:00Z',
  permissions: [
    'VIEW_CUSTOMERS',
    'COLLECT_PAYMENT',
    'VIEW_TRANSACTIONS',
    'VIEW_PRODUCTS',
  ],
  areas: ['Kandrapadu', 'OBK V Palem', 'Gannavaram'],
  stats: {
    totalCollections: 1284,
    todayCollections: 14,
    monthCollections: 178,
    pendingCollections: 37,
    avgDailyCollections: 8.4,
    totalCustomers: 487,
    totalAmountCollected: 641200,
    todayAmount: 6980,
    monthAmount: 88650,
  },
};

export default function ManageAgent() {
  const [agent, setAgent] = useState(MOCK_AGENT);
  const { toasts, toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmLoginAs, setConfirmLoginAs] = useState(false);

  const handleEdit = useCallback(
    (data) => {
      setAgent((prev) => ({ ...prev, ...data }));
      toast('Profile updated successfully');
    },
    [toast],
  );

  const handlePermissionsSave = useCallback(
    (perms) => {
      setAgent((prev) => ({ ...prev, permissions: perms }));
      toast('Permissions saved');
    },
    [toast],
  );

  const handleAreasSave = useCallback(
    (areas) => {
      setAgent((prev) => ({ ...prev, areas }));
      toast('Areas updated');
    },
    [toast],
  );

  const handleToggleStatus = useCallback(
    (newStatus) => {
      setAgent((prev) => ({ ...prev, status: newStatus }));
      toast(
        newStatus === 'active' ? 'Agent activated' : 'Agent suspended',
        newStatus === 'suspended' ? 'warning' : 'success',
      );
    },
    [toast],
  );

  const handleLoginAs = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast('Logged in as agent — opening agent dashboard');
    setConfirmLoginAs(false);
  }, [toast]);

  const handleResetPassword = useCallback(() => {
    toast('Password reset successfully');
  }, [toast]);

  const handleForceLogout = useCallback(() => {
    setAgent((prev) => ({ ...prev, online: false }));
    toast('Agent forcefully logged out', 'warning');
  }, [toast]);

  const handleDelete = useCallback(() => {
    toast('Agent deleted (soft delete)', 'error');
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        agent={agent}
        onEdit={() => setEditOpen(true)}
        onToggleStatus={handleToggleStatus}
        onLoginAs={() => setConfirmLoginAs(true)}
        onBack={() => window.history.back()}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        {/* Overview Cards - You'll need to add this component */}
        {/* <OverviewCards agent={agent} /> */}

        {/* Two-column layout for Permissions and Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PermissionsCard agent={agent} onSave={handlePermissionsSave} />
          <AssignedAreasCard agent={agent} onSave={handleAreasSave} />
        </div>

        {/* Collection Performance */}
        <CollectionPerformanceCard agent={agent} />

        {/* Danger Zone / Account Management */}
        <DangerZoneCard
          agent={agent}
          onResetPassword={handleResetPassword}
          onForceLogout={handleForceLogout}
          onSuspend={() => handleToggleStatus('suspended')}
          onActivate={() => handleToggleStatus('active')}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        agent={agent}
        onSave={handleEdit}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
