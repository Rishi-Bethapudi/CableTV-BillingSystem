// atoms.tsx
import { useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

// ============================================
// UTILITIES
// ============================================
export const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const initials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// ============================================
// CONSTANTS
// ============================================
export const ROLES = [
  { value: 'field_agent', label: 'Field Agent', color: 'blue' },
  { value: 'collection_agent', label: 'Collection Agent', color: 'emerald' },
  { value: 'support_agent', label: 'Support Agent', color: 'violet' },
  { value: 'technical_agent', label: 'Technical Agent', color: 'orange' },
  { value: 'manager', label: 'Manager', color: 'rose' },
];

export const PERMISSION_GROUPS = {
  Customers: [
    { id: 'VIEW_CUSTOMERS', label: 'View Customers' },
    { id: 'CREATE_CUSTOMERS', label: 'Create Customers' },
    { id: 'EDIT_CUSTOMERS', label: 'Edit Customers' },
    { id: 'DELETE_CUSTOMERS', label: 'Delete Customers', critical: true },
  ],
  Collections: [
    { id: 'COLLECT_PAYMENT', label: 'Collect Payment', critical: true },
    { id: 'VIEW_TRANSACTIONS', label: 'View Transactions' },
  ],
  Products: [
    { id: 'VIEW_PRODUCTS', label: 'View Products' },
    { id: 'CREATE_PRODUCTS', label: 'Create Products' },
    { id: 'EDIT_PRODUCTS', label: 'Edit Products' },
    { id: 'DELETE_PRODUCTS', label: 'Delete Products', critical: true },
  ],
  Subscriptions: [
    {
      id: 'MANAGE_SUBSCRIPTIONS',
      label: 'Manage Subscriptions',
      critical: true,
    },
  ],
  Reports: [{ id: 'VIEW_REPORTS', label: 'View Reports' }],
  Agents: [{ id: 'VIEW_AGENTS', label: 'View Agents' }],
  Expenses: [
    { id: 'VIEW_EXPENSES', label: 'View Expenses' },
    { id: 'CREATE_EXPENSE', label: 'Create Expense' },
    { id: 'EDIT_EXPENSE', label: 'Edit Expense' },
    { id: 'DELETE_EXPENSE', label: 'Delete Expense', critical: true },
  ],
};

export const PAYMENT_MODES = ['Cash', 'UPI', 'Online', 'Card', 'NEFT'];

// Role meta derived from ROLES
export const ROLE_META = Object.fromEntries(ROLES.map((r) => [r.value, r]));

export const ROLE_COLORS = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

// ============================================
// ATOMIC COMPONENTS
// ============================================
export function StatusBadge({ status }) {
  const cfg =
    {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inactive: 'bg-slate-100 text-slate-600 border-slate-200',
      suspended: 'bg-red-50 text-red-700 border-red-200',
    }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  const dot = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    suspended: 'bg-red-500',
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function RoleBadge({ role }) {
  const meta = ROLE_META[role];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${ROLE_COLORS[meta.color]}`}
    >
      {meta.label}
    </span>
  );
}

export function OnlineIndicator({ online }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${online ? 'text-emerald-600' : 'text-slate-400'}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-300'}`}
        />
        {online && (
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
        )}
      </span>
      {online ? 'Online' : 'Offline'}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon size={14} className="text-slate-600" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ============================================
// TOAST SYSTEM
// ============================================
export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto ${
            t.type === 'success'
              ? 'bg-slate-900 text-white'
              : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertTriangle size={14} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, toast };
}
