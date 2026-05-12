// AgentHeader.tsx
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Edit2,
  LogIn,
  Ban,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { StatusBadge, RoleBadge, OnlineIndicator } from '../Atoms';
import { fmtDate, initials } from '../Atoms'; // Import from atoms

export function PageHeader({
  agent,
  onEdit,
  onToggleStatus,
  onLoginAs,
  onBack,
}) {
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
