import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  Send,
  CalendarDays,
  CheckCircle2,
  User,
  Building2,
  CreditCard,
  Settings2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

// ─── Sample user data (replace with your real dispatch/store values) ───
const INITIAL_USER = {
  name: 'Mahi Communications',
  mobile: '9441995758',
  ownerName: '',
  agencyName: 'MAHI COMMUNICATIONS',
  gstNumber: 'N/A',
  phonePayNo: '9441775758',
  state: 'Andhra Pradesh',
  city: 'KANDRAPADU , O B K V PALEM',
  address: 'KANDRAPADU , O B K V PALEM',
  expiryDate: '06-Apr-2027',
  coverImage:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  profileImage: null,
  // Billing Preference defaults
  billingCycle: 'monthly',
  billingEmail: 'billing@mahicomm.in',
  autoRenew: true,
  paymentMode: 'upi',
  // Default Settings defaults
  notifyEmail: true,
  notifySms: true,
  notifyWhatsapp: true,
  language: 'english',
  timezone: 'Asia/Kolkata',
  // Account Details defaults
  username: 'mahicomm',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false,
};

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function FormField({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 shadow-2xl"
      style={{ animation: 'slideUp 0.3s ease' }}
    >
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span className="text-sm font-medium text-white">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-slate-400 hover:text-white text-lg leading-none"
      >
        ×
      </button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── Section header banner ────────────────────────────────────────────────────
function SectionBanner({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-100 px-4 py-3 mb-6">
      <Icon size={17} className="text-teal-600 shrink-0" />
      <span className="text-sm font-semibold text-teal-700">{title}</span>
    </div>
  );
}

// ─── Update button ────────────────────────────────────────────────────────────
function UpdateButton({ onClick }) {
  return (
    <div className="flex justify-center pt-4">
      <Button
        onClick={onClick}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Update <Send size={14} />
      </Button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function GeneralDetailsTab({ data, onChange, onSave }) {
  return (
    <div>
      <SectionBanner
        icon={Building2}
        title="Manage your Office Name, Address, Location and GST Details"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Mobile Number">
          <Input
            value={data.mobile}
            onChange={(e) => onChange('mobile', e.target.value)}
            placeholder="Mobile number"
          />
        </FormField>
        <FormField label="Owner Name">
          <Input
            value={data.ownerName}
            onChange={(e) => onChange('ownerName', e.target.value)}
            placeholder="Owner Name"
          />
        </FormField>
        <FormField label="Agency Name">
          <Input
            value={data.agencyName}
            onChange={(e) => onChange('agencyName', e.target.value)}
            placeholder="Agency Name"
          />
        </FormField>
        <FormField label="GST Number">
          <Input
            value={data.gstNumber}
            onChange={(e) => onChange('gstNumber', e.target.value)}
            placeholder="GST Number"
          />
        </FormField>
        <FormField label="Phone Pay Number">
          <Input
            value={data.phonePayNo}
            onChange={(e) => onChange('phonePayNo', e.target.value)}
            placeholder="Phone Pay No"
          />
        </FormField>
        <FormField label="State">
          <Input
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="State"
          />
        </FormField>
        <FormField label="City">
          <Input
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="City"
          />
        </FormField>
        <FormField label="Address" className="sm:col-span-2">
          <Textarea
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Full address"
            rows={3}
          />
        </FormField>
      </div>
      <Separator className="my-6" />
      <UpdateButton onClick={onSave} />
    </div>
  );
}

function BillingPreferenceTab({ data, onChange, onSave }) {
  return (
    <div>
      <SectionBanner
        icon={CreditCard}
        title="Manage your Billing Cycle, Payment Mode and Preferences"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Billing Email">
          <Input
            type="email"
            value={data.billingEmail}
            onChange={(e) => onChange('billingEmail', e.target.value)}
            placeholder="billing@example.com"
          />
        </FormField>
        <FormField label="Billing Cycle">
          <Select
            value={data.billingCycle}
            onValueChange={(v) => onChange('billingCycle', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="halfyearly">Half-Yearly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Payment Mode">
          <Select
            value={data.paymentMode}
            onValueChange={(v) => onChange('paymentMode', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upi">UPI / Phone Pay</SelectItem>
              <SelectItem value="netbanking">Net Banking</SelectItem>
              <SelectItem value="card">Debit / Credit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Auto Renewal">
          <div className="flex items-center gap-3 mt-1.5">
            <Switch
              checked={data.autoRenew}
              onCheckedChange={(v) => onChange('autoRenew', v)}
              id="auto-renew"
            />
            <Label
              htmlFor="auto-renew"
              className="text-sm text-slate-600 cursor-pointer"
            >
              {data.autoRenew
                ? 'Enabled — plan auto-renews'
                : 'Disabled — manual renewal required'}
            </Label>
          </div>
        </FormField>
      </div>

      <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
          Current Plan Expiry
        </p>
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-800">
            {data.expiryDate}
          </span>
        </div>
      </div>

      <Separator className="my-6" />
      <UpdateButton onClick={onSave} />
    </div>
  );
}

function DefaultSettingsTab({ data, onChange, onSave }) {
  return (
    <div>
      <SectionBanner
        icon={Settings2}
        title="Manage Notifications, Language and Regional Settings"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Language">
          <Select
            value={data.language}
            onValueChange={(v) => onChange('language', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="telugu">Telugu</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Timezone">
          <Select
            value={data.timezone}
            onValueChange={(v) => onChange('timezone', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">
                Asia / Kolkata (IST +5:30)
              </SelectItem>
              <SelectItem value="Asia/Dubai">
                Asia / Dubai (GST +4:00)
              </SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notification Channels
        </p>
        {[
          {
            key: 'notifyEmail',
            label: 'Email Notifications',
            desc: 'Receive alerts and invoices via email',
          },
          {
            key: 'notifySms',
            label: 'SMS Notifications',
            desc: 'Receive alerts on your registered mobile',
          },
          {
            key: 'notifyWhatsapp',
            label: 'WhatsApp Notifications',
            desc: 'Receive messages on WhatsApp',
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <Switch
              checked={data[key]}
              onCheckedChange={(v) => onChange(key, v)}
            />
          </div>
        ))}
      </div>

      <Separator className="my-6" />
      <UpdateButton onClick={onSave} />
    </div>
  );
}

function AccountDetailsTab({ data, onChange, onSave }) {
  return (
    <div>
      <SectionBanner
        icon={ShieldCheck}
        title="Manage Username, Password and Security Settings"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Username" className="sm:col-span-2">
          <Input
            value={data.username}
            onChange={(e) => onChange('username', e.target.value)}
            placeholder="Username"
          />
        </FormField>
        <Separator className="sm:col-span-2" />
        <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Change Password
        </p>
        <FormField label="Current Password">
          <Input
            type="password"
            value={data.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            placeholder="Current password"
          />
        </FormField>
        <FormField label="New Password">
          <Input
            type="password"
            value={data.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            placeholder="New password"
          />
        </FormField>
        <FormField label="Confirm New Password" className="sm:col-span-2">
          <Input
            type="password"
            value={data.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Confirm new password"
          />
        </FormField>
        <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
              <KeyRound size={14} /> Two-Factor Authentication
            </p>
            <p className="text-xs text-slate-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={data.twoFactor}
            onCheckedChange={(v) => onChange('twoFactor', v)}
          />
        </div>
      </div>
      <Separator className="my-6" />
      <UpdateButton onClick={onSave} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState(INITIAL_USER);
  const [toast, setToast] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const handleChange = (field, value) =>
    setUser((prev) => ({ ...prev, [field]: value }));

  const showToast = (section) => {
    setToast(`${section} updated successfully!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ── Page title ── */}
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          Profile —{' '}
          <span className="text-slate-500 font-medium text-xl">
            {user.cableName || 'Cable TV'} Account Settings
          </span>
        </h1>

        {/* ── Cover + Profile hero ─────────────────────────────────────────── */}
        <div className="relative mb-16 rounded-2xl overflow-visible shadow-md">
          {/* Cover image */}
          <div className="relative h-48 sm:h-60 rounded-2xl overflow-hidden group">
            <img
              src={coverPreview || user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Expiry badge — top right */}
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 shadow-lg">
              <CalendarDays size={14} className="text-amber-400" />
              Expiry on :- {user.expiryDate}
            </div>

            {/* Name overlay — bottom left */}
            <div className="absolute bottom-4 left-44 sm:left-52">
              <p className="text-white text-xl sm:text-2xl font-bold tracking-wide drop-shadow-lg">
                {user.agencyName}
              </p>
            </div>

            {/* Cover change button */}
            <label className="absolute bottom-3 right-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/30">
                <Camera size={13} /> Change Cover
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </label>
          </div>

          {/* Profile picture — overlapping cover */}
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                {profilePreview || user.profileImage ? (
                  <img
                    src={profilePreview || user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white select-none">
                      {user.agencyName?.slice(0, 2).toUpperCase() || 'MC'}
                    </span>
                  </div>
                )}
              </div>
              {/* Profile change overlay */}
              <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── Tabs Card ────────────────────────────────────────────────────── */}
        <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
          <CardContent className="p-5 sm:p-8">
            <Tabs defaultValue="general">
              {/* Tab triggers */}
              <TabsList className="w-full flex flex-wrap gap-1 h-auto bg-slate-100 rounded-xl p-1 mb-6">
                {[
                  {
                    value: 'general',
                    label: 'General Details',
                    icon: Building2,
                  },
                  {
                    value: 'billing',
                    label: 'Billing Preference',
                    icon: CreditCard,
                  },
                  {
                    value: 'settings',
                    label: 'Default Settings',
                    icon: Settings2,
                  },
                  { value: 'account', label: 'Account Details', icon: User },
                ].map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="general">
                <GeneralDetailsTab
                  data={user}
                  onChange={handleChange}
                  onSave={() => showToast('General Details')}
                />
              </TabsContent>

              <TabsContent value="billing">
                <BillingPreferenceTab
                  data={user}
                  onChange={handleChange}
                  onSave={() => showToast('Billing Preference')}
                />
              </TabsContent>

              <TabsContent value="settings">
                <DefaultSettingsTab
                  data={user}
                  onChange={handleChange}
                  onSave={() => showToast('Default Settings')}
                />
              </TabsContent>

              <TabsContent value="account">
                <AccountDetailsTab
                  data={user}
                  onChange={handleChange}
                  onSave={() => showToast('Account Details')}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
