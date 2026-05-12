// AgentActions.tsx
import { useState } from 'react';
import {
  Key,
  LogOut,
  Ban,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmDialog, ResetPasswordModal } from './AgentDialogs';

export function DangerZoneCard({
  agent,
  onResetPassword,
  onForceLogout,
  onSuspend,
  onActivate,
  onDelete,
}) {
  const [confirm, setConfirm] = useState(null);
  const [pwOpen, setPwOpen] = useState(false);

  const actions = [
    {
      icon: Key,
      label: 'Reset Password',
      desc: 'Set a new password for this agent',
      variant: 'default',
      action: () => setPwOpen(true),
    },
    {
      icon: LogOut,
      label: 'Force Logout',
      desc: 'Immediately invalidate all active sessions',
      variant: 'default',
      action: () => setConfirm('logout'),
    },
    agent.status === 'active'
      ? {
          icon: Ban,
          label: 'Suspend Agent',
          desc: 'Block agent from accessing the system',
          variant: 'warning',
          action: () => setConfirm('suspend'),
        }
      : {
          icon: CheckCircle2,
          label: 'Activate Agent',
          desc: 'Restore access to the system',
          variant: 'success',
          action: () => onActivate(),
        },
    {
      icon: Trash2,
      label: 'Delete Agent',
      desc: 'Soft delete — marks agent as deleted, data retained',
      variant: 'destructive',
      action: () => setConfirm('delete'),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-red-100 bg-red-50">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={14} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900">
              Account Management
            </h3>
            <p className="text-xs text-red-500 mt-0.5">
              Irreversible actions — proceed with caution
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map(({ icon: Icon, label, desc, variant, action }) => (
              <div
                key={label}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  variant === 'destructive'
                    ? 'border-red-100 hover:bg-red-50 hover:border-red-200'
                    : variant === 'warning'
                      ? 'border-amber-100 hover:bg-amber-50 hover:border-amber-200'
                      : variant === 'success'
                        ? 'border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'
                        : 'border-slate-100 hover:bg-slate-50'
                }`}
                onClick={action}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    variant === 'destructive'
                      ? 'bg-red-100'
                      : variant === 'warning'
                        ? 'bg-amber-100'
                        : variant === 'success'
                          ? 'bg-emerald-100'
                          : 'bg-slate-100'
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      variant === 'destructive'
                        ? 'text-red-600'
                        : variant === 'warning'
                          ? 'text-amber-600'
                          : variant === 'success'
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                    }
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      variant === 'destructive'
                        ? 'text-red-800'
                        : variant === 'warning'
                          ? 'text-amber-800'
                          : 'text-slate-800'
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm modals */}
      <ConfirmDialog
        open={confirm === 'logout'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          onForceLogout();
          setConfirm(null);
        }}
        title="Force Logout?"
        description="All active sessions for this agent will be immediately invalidated."
        confirmLabel="Force Logout"
        variant="warning"
      />
      <ConfirmDialog
        open={confirm === 'suspend'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          onSuspend();
          setConfirm(null);
        }}
        title="Suspend Agent?"
        description="Agent will lose all system access immediately. You can reactivate at any time."
        confirmLabel="Suspend Agent"
        variant="warning"
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          onDelete();
          setConfirm(null);
        }}
        title={`Delete ${agent.name}?`}
        description="Agent will be soft-deleted. Data is retained with isDeleted=true and deletedAt timestamp. This cannot be undone from the UI."
        confirmLabel="Delete Agent"
        variant="destructive"
      />
      <ResetPasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        agentName={agent.name}
        onReset={onResetPassword}
      />
    </>
  );
}
