// AgentDialogs.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { RefreshCw, Lock, AlertTriangle } from 'lucide-react';
import { ROLES } from '../Atoms';

// ============================================
// CONFIRM DIALOG
// ============================================
export function ConfirmDialog({
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

// ============================================
// EDIT PROFILE MODAL
// ============================================
export function EditProfileModal({ open, onClose, agent, onSave }) {
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

// ============================================
// RESET PASSWORD MODAL
// ============================================
export function ResetPasswordModal({ open, onClose, agentName, onReset }) {
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
