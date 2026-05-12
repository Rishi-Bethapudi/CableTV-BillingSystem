/**
 * ManageAgent.jsx
 * Route: /operators/agents/:agentId
 * Cable TV Billing & Collection System — Operator Dashboard
 *
 * Replace mock data with:
 *   useQuery(["agent", agentId], () => api.get(`/api/v1/operators/agents/${agentId}`))
 *   useMutation for PATCH/POST/DELETE endpoints
 *   useParams() from react-router-dom for agentId
 */

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit2,
  LogIn,
  Ban,
  CheckCircle2,
  Trash2,
  Key,
  RefreshCw,
  MapPin,
  X,
  Plus,
  Search,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  Activity,
  Shield,
  AlertTriangle,
  Check,
  Phone,
  Mail,
  TrendingUp,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Lock,
  Info,
  Hash,
  BarChart3,
  LogOut,
  Layers,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════

const ROLES = [
  { value: 'field_agent', label: 'Field Agent', color: 'blue' },
  { value: 'collection_agent', label: 'Collection Agent', color: 'emerald' },
  { value: 'support_agent', label: 'Support Agent', color: 'violet' },
  { value: 'technical_agent', label: 'Technical Agent', color: 'orange' },
  { value: 'manager', label: 'Manager', color: 'rose' },
];

const PERMISSION_GROUPS = {
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

const ALL_LOCALITIES = [
  'Kandrapadu',
  'OBK V Palem',
  'Gannavaram',
  'Nuzvid',
  'Vijayawada Central',
  'Eluru',
  'Gudivada',
  'Machilipatnam',
  'Tenali',
  'Bhimavaram',
  'Narsapur',
  'Palakol',
  'Rajam',
  'Srikakulam',
  'Narasannapeta',
];

const PAYMENT_MODES = ['Cash', 'UPI', 'Online', 'Card', 'NEFT'];

// ══════════════════════════════════════════════════════════════════════
// MOCK DATA  (replace with useQuery result)
// ══════════════════════════════════════════════════════════════════════

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

const MOCK_TRANSACTIONS = Array.from({ length: 18 }, (_, i) => ({
  id: `TXN-${String(1000 + i).padStart(4, '0')}`,
  customer: [
    'C. Ramesh',
    'P. Latha',
    'K. Suresh',
    'M. Anand',
    'S. Devi',
    'R. Pillai',
  ][i % 6],
  area: ['Kandrapadu', 'OBK V Palem', 'Gannavaram'][i % 3],
  amount: [499, 699, 349, 849, 249, 599][i % 6],
  date: new Date(Date.now() - i * 86400000 * 0.7).toISOString(),
  mode: PAYMENT_MODES[i % 5],
  status: i % 7 === 0 ? 'pending' : 'collected',
}));

// ══════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════

const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const initials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const ROLE_META = Object.fromEntries(ROLES.map((r) => [r.value, r]));
const ROLE_COLORS = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

// ══════════════════════════════════════════════════════════════════════
// ATOMS
// ══════════════════════════════════════════════════════════════════════

function StatusBadge({ status }) {
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

function RoleBadge({ role }) {
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

function OnlineIndicator({ online }) {
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

function SectionCard({
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

// ══════════════════════════════════════════════════════════════════════
// TOAST (lightweight)
// ══════════════════════════════════════════════════════════════════════

function ToastContainer({ toasts }) {
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

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, toast };
}

// ══════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ══════════════════════════════════════════════════════════════════════

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'destructive',
}) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    onConfirm();
    setLoading(false);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              variant === 'destructive'
                ? 'bg-red-100'
                : variant === 'warning'
                  ? 'bg-amber-100'
                  : 'bg-blue-100'
            }`}
          >
            <AlertTriangle
              size={18}
              className={
                variant === 'destructive'
                  ? 'text-red-600'
                  : variant === 'warning'
                    ? 'text-amber-600'
                    : 'text-blue-600'
              }
            />
          </div>
          <DialogTitle className="text-base font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={loading}
            onClick={handle}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : variant === 'warning'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : ''
            }
          >
            {loading && <RefreshCw size={13} className="animate-spin mr-1.5" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════════
// EDIT PROFILE MODAL
// ══════════════════════════════════════════════════════════════════════

function EditProfileModal({ open, onClose, agent, onSave }) {
  const [form, setForm] = useState({
    name: agent.name,
    email: agent.email,
    mobile: agent.mobile,
    role: agent.role,
    employeeCode: agent.employeeCode,
    address: agent.address || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Edit Agent Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Update personal and account details
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Full Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Employee Code
            </Label>
            <Input
              value={form.employeeCode}
              onChange={(e) => set('employeeCode', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Mobile
            </Label>
            <Input
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Email
            </Label>
            <Input
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="h-9 text-sm"
              type="email"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">Role</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Address
            </Label>
            <Textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !form.name}
            className="bg-slate-900 hover:bg-slate-700 text-white min-w-[100px]"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin mr-1.5" />{' '}
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════════
// RESET PASSWORD MODAL
// ══════════════════════════════════════════════════════════════════════

function ResetPasswordModal({ open, onClose, agentName, onReset }) {
  const [pw, setPw] = useState({ new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const mismatch = pw.new && pw.confirm && pw.new !== pw.confirm;
  const valid = pw.new.length >= 6 && !mismatch;

  const handle = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    onReset(pw.new);
    setSaving(false);
    setPw({ new: '', confirm: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Set a new password for {agentName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              New Password
            </Label>
            <Input
              type="password"
              value={pw.new}
              onChange={(e) => setPw((p) => ({ ...p, new: e.target.value }))}
              placeholder="Min. 6 characters"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">
              Confirm Password
            </Label>
            <Input
              type="password"
              value={pw.confirm}
              onChange={(e) =>
                setPw((p) => ({ ...p, confirm: e.target.value }))
              }
              placeholder="Re-enter password"
              className="h-9 text-sm"
            />
            {mismatch && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!valid || saving}
            onClick={handle}
            className="bg-slate-900 hover:bg-slate-700 text-white"
          >
            {saving ? (
              <RefreshCw size={13} className="animate-spin mr-1" />
            ) : (
              <Lock size={13} className="mr-1" />
            )}
            {saving ? 'Updating...' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 1 — PAGE HEADER
// ══════════════════════════════════════════════════════════════════════

function PageHeader({ agent, onEdit, onToggleStatus, onLoginAs, onBack }) {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        {/* Back + breadcrumb */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-3 group"
        >
          <ChevronLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Agents
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* LEFT — Identity */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                {initials(agent.name)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${agent.online ? 'bg-emerald-500' : 'bg-slate-400'}`}
                />
                {agent.online && (
                  <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-50" />
                )}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {agent.name}
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {agent.employeeCode}
                </span>
                <RoleBadge role={agent.role} />
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <Calendar size={11} />
                Joined {fmtDate(agent.joinedDate)}
                <span className="mx-1">·</span>
                <OnlineIndicator online={agent.online} />
              </p>
            </div>
          </div>

          {/* RIGHT — Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-1.5 h-8 text-xs"
            >
              <Edit2 size={12} /> Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginAs}
              className="gap-1.5 h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <LogIn size={12} /> Login As Agent
            </Button>
            {agent.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus('suspended')}
                className="gap-1.5 h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Ban size={12} /> Suspend
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onToggleStatus('active')}
                className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 size={12} /> Activate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 2 — OVERVIEW CARDS
// ══════════════════════════════════════════════════════════════════════

function OverviewCards({ agent }) {
  const s = agent.stats;
  const cards = [
    {
      icon: Receipt,
      label: 'Total Collections',
      value: s.totalCollections.toLocaleString(),
      sub: fmtINR(s.totalAmountCollected),
      iconCls: 'bg-slate-900 text-white',
    },
    {
      icon: TrendingUp,
      label: "Today's Collections",
      value: s.todayCollections,
      sub: fmtINR(s.todayAmount),
      iconCls: 'bg-blue-600 text-white',
    },
    {
      icon: BarChart3,
      label: 'This Month',
      value: s.monthCollections,
      sub: fmtINR(s.monthAmount),
      iconCls: 'bg-violet-600 text-white',
    },
    {
      icon: MapPin,
      label: 'Assigned Areas',
      value: agent.areas.length,
      sub: `${ALL_LOCALITIES.length} total available`,
      iconCls: 'bg-teal-600 text-white',
    },
    {
      icon: Users,
      label: 'Customers Under Areas',
      value: s.totalCustomers.toLocaleString(),
      sub: 'across all areas',
      iconCls: 'bg-emerald-600 text-white',
    },
    {
      icon: Clock,
      label: 'Last Login',
      value: timeAgo(agent.lastLogin),
      sub: `${fmtDate(agent.lastLogin)} ${fmtTime(agent.lastLogin)}`,
      iconCls: 'bg-amber-500 text-white',
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(({ icon: Icon, label, value, sub, iconCls }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls}`}
          >
            <Icon size={15} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">
              {value}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 leading-tight">
              {label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 3 — PERSONAL DETAILS
// ══════════════════════════════════════════════════════════════════════

function PersonalDetailsCard({ agent, onEdit }) {
  const rows = [
    {
      icon: Hash,
      label: 'Employee Code',
      value: (
        <span className="font-mono text-sm text-slate-800">
          {agent.employeeCode}
        </span>
      ),
    },
    { icon: Phone, label: 'Mobile', value: agent.mobile },
    { icon: Mail, label: 'Email', value: agent.email },
    { icon: Shield, label: 'Role', value: <RoleBadge role={agent.role} /> },
    {
      icon: MapPin,
      label: 'Address',
      value: agent.address || (
        <span className="text-slate-400 italic">Not provided</span>
      ),
    },
    {
      icon: Clock,
      label: 'Last Login',
      value: `${timeAgo(agent.lastLogin)} · ${fmtDate(agent.lastLogin)} ${fmtTime(agent.lastLogin)}`,
    },
    { icon: Calendar, label: 'Joined On', value: fmtDate(agent.joinedDate) },
  ];

  return (
    <SectionCard
      title="Personal Information"
      icon={Users}
      description="Account details and contact information"
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-1.5 h-7 text-xs"
        >
          <Edit2 size={11} /> Edit
        </Button>
      }
    >
      <div className="space-y-0 divide-y divide-slate-50">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={13} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">{label}</p>
              <div className="text-sm text-slate-700 font-medium mt-0.5 break-words">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 4 — PERMISSIONS
// ══════════════════════════════════════════════════════════════════════

function PermissionsCard({ agent, onSave }) {
  const [selected, setSelected] = useState(new Set(agent.permissions));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setDirty(true);
  };

  const toggleGroup = (groupPerms) => {
    const ids = groupPerms.map((p) => p.id);
    const allIn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allIn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave([...selected]);
    setSaving(false);
    setDirty(false);
  };

  return (
    <SectionCard
      title="Access Control & Permissions"
      icon={Shield}
      description={`${selected.size} permissions enabled`}
      action={
        dirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
          >
            {saving ? (
              <>
                <RefreshCw size={11} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check size={11} /> Save
              </>
            )}
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
          const ids = perms.map((p) => p.id);
          const allIn = ids.every((id) => selected.has(id));
          const someIn = ids.some((id) => selected.has(id));
          const count = ids.filter((id) => selected.has(id)).length;

          return (
            <div key={group}>
              <div
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => toggleGroup(perms)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      allIn
                        ? 'bg-slate-900 border-slate-900'
                        : someIn
                          ? 'bg-slate-200 border-slate-300'
                          : 'bg-white border-slate-300'
                    }`}
                  >
                    {allIn && <Check size={10} className="text-white" />}
                    {someIn && !allIn && (
                      <div className="w-2 h-0.5 bg-slate-700 rounded" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {group}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {count}/{ids.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                {perms.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div
                      onClick={() => toggle(perm.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        selected.has(perm.id)
                          ? 'bg-slate-900 border-slate-900'
                          : 'bg-white border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {selected.has(perm.id) && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1.5 min-w-0"
                      onClick={() => toggle(perm.id)}
                    >
                      <span className="text-sm text-slate-700">
                        {perm.label}
                      </span>
                      {perm.critical && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 uppercase">
                          Critical
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {Object.keys(PERMISSION_GROUPS).indexOf(group) <
                Object.keys(PERMISSION_GROUPS).length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
      </div>

      {dirty && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Info size={13} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Unsaved permission changes. Click Save to apply.
          </p>
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 5 — ASSIGNED AREAS
// ══════════════════════════════════════════════════════════════════════

function AssignedAreasCard({ agent, onSave }) {
  const [areas, setAreas] = useState(agent.areas);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const available = ALL_LOCALITIES.filter(
    (l) => !areas.includes(l) && l.toLowerCase().includes(search.toLowerCase()),
  );

  const add = (name) => {
    if (!areas.includes(name)) {
      setAreas((p) => [...p, name]);
      setDirty(true);
    }
    setSearch('');
    setShowDropdown(false);
  };

  const remove = (name) => {
    setAreas((p) => p.filter((a) => a !== name));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave(areas);
    setSaving(false);
    setDirty(false);
  };

  return (
    <SectionCard
      title="Assigned Collection Areas"
      icon={MapPin}
      description={`${areas.length} area(s) — agent can only access customers in these areas`}
      action={
        dirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
          >
            {saving ? (
              <>
                <RefreshCw size={11} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check size={11} /> Save
              </>
            )}
          </Button>
        )
      }
    >
      {/* Assigned chips */}
      {areas.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {areas.map((area) => (
            <div
              key={area}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-blue-50 border border-blue-200 rounded-full"
            >
              <MapPin size={11} className="text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-blue-700">
                {area}
              </span>
              <button
                onClick={() => remove(area)}
                className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            No areas assigned. Agent cannot access any customers.
          </p>
        </div>
      )}

      {/* Add area */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search and add areas..."
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {showDropdown && search && available.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {available.slice(0, 6).map((loc) => (
              <button
                key={loc}
                onClick={() => add(loc)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 text-sm text-slate-700 text-left transition-colors"
              >
                <Plus size={13} className="text-slate-400" /> {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 6 — COLLECTION PERFORMANCE
// ══════════════════════════════════════════════════════════════════════

const PERF_PAGE_SIZE = 6;

function CollectionPerformanceCard({ agent }) {
  const s = agent.stats;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(MOCK_TRANSACTIONS.length / PERF_PAGE_SIZE);
  const paginated = MOCK_TRANSACTIONS.slice(
    (page - 1) * PERF_PAGE_SIZE,
    page * PERF_PAGE_SIZE,
  );

  const summaryCards = [
    {
      label: 'Today',
      value: s.todayCollections,
      amount: fmtINR(s.todayAmount),
      color: 'border-blue-200 bg-blue-50',
    },
    {
      label: 'This Week',
      value: Math.round(s.todayCollections * 5.2),
      amount: fmtINR(s.todayAmount * 5.2),
      color: 'border-violet-200 bg-violet-50',
    },
    {
      label: 'This Month',
      value: s.monthCollections,
      amount: fmtINR(s.monthAmount),
      color: 'border-emerald-200 bg-emerald-50',
    },
    {
      label: 'Pending',
      value: s.pendingCollections,
      amount: '',
      color: 'border-amber-200 bg-amber-50',
    },
    {
      label: 'Avg/Day',
      value: s.avgDailyCollections,
      amount: '',
      color: 'border-slate-200 bg-slate-50',
    },
  ];

  return (
    <SectionCard
      title="Collection Performance"
      icon={TrendingUp}
      description="Transactions and collection analytics"
    >
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        {summaryCards.map(({ label, value, amount, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-3 text-center ${color}`}
          >
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-600 font-medium">{label}</p>
            {amount && (
              <p className="text-xs text-slate-500 mt-0.5">{amount}</p>
            )}
          </div>
        ))}
      </div>

      {/* Transactions — Desktop table */}
      <div className="hidden sm:block">
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Customer', 'Area', 'Amount', 'Date', 'Mode', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-800">
                    {txn.customer}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{txn.area}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">
                    {fmtINR(txn.amount)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {fmtDate(txn.date)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {txn.mode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        txn.status === 'collected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {txn.status === 'collected' ? 'Collected' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions — Mobile cards */}
      <div className="sm:hidden space-y-2">
        {paginated.map((txn) => (
          <div key={txn.id} className="border border-slate-100 rounded-xl p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {txn.customer}
                </p>
                <p className="text-xs text-slate-400">
                  {txn.area} · {fmtDate(txn.date)}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  txn.status === 'collected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {txn.status === 'collected' ? 'Collected' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {fmtINR(txn.amount)}
              </span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {txn.mode}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={13} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 7 — ACTIVITY
// ══════════════════════════════════════════════════════════════════════

function ActivityCard({ agent }) {
  return (
    <SectionCard
      title="Agent Activity"
      icon={Activity}
      description="Login and operational activity"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: 'Connection',
            value: <OnlineIndicator online={agent.online} />,
          },
          {
            label: 'Last Login',
            value: timeAgo(agent.lastLogin),
          },
          {
            label: 'Last Collection',
            value: timeAgo(agent.lastCollection),
          },
          {
            label: 'Account Status',
            value: <StatusBadge status={agent.status} />,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-slate-50 rounded-xl p-3 border border-slate-100"
          >
            <p className="text-xs text-slate-400 mb-1.5">{label}</p>
            <div className="text-sm font-semibold text-slate-800">{value}</div>
          </div>
        ))}
      </div>

      {/* Login History placeholder */}
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center mx-auto mb-3">
          <Clock size={18} className="text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Login History</p>
        <p className="text-xs text-slate-400 mt-1">
          Detailed login logs coming soon
        </p>
        <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">
          Coming Soon
        </span>
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 8 — DANGER ZONE
// ══════════════════════════════════════════════════════════════════════

function DangerZoneCard({
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

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════

export default function ManageAgent() {
  // In production: const { agentId } = useParams(); + useQuery
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
    // POST /api/v1/operators/agents/:agentId/login-as-agent
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
    // In production: navigate back to /operators/agents
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <PageHeader
        agent={agent}
        onEdit={() => setEditOpen(true)}
        onToggleStatus={handleToggleStatus}
        onLoginAs={() => setConfirmLoginAs(true)}
        onBack={() => window.history.back()}
      />

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        {/* Overview Cards */}
        <OverviewCards agent={agent} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT column — 1/3 */}
          <div className="space-y-5">
            <PersonalDetailsCard
              agent={agent}
              onEdit={() => setEditOpen(true)}
            />
            <ActivityCard agent={agent} />
          </div>

          {/* RIGHT column — 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <PermissionsCard agent={agent} onSave={handlePermissionsSave} />
            <AssignedAreasCard agent={agent} onSave={handleAreasSave} />
          </div>
        </div>

        {/* Full width */}
        <CollectionPerformanceCard agent={agent} />
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

      <ConfirmDialog
        open={confirmLoginAs}
        onClose={() => setConfirmLoginAs(false)}
        onConfirm={handleLoginAs}
        title={`Login as ${agent.name}?`}
        description="You will be impersonating this agent. All actions will be recorded. Your operator session will be restored when you exit."
        confirmLabel="Proceed"
        variant="info"
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
