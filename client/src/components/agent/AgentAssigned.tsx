// AgentAssigned.tsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  X,
  Plus,
  Search,
  AlertTriangle,
  Check,
  RefreshCw,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SectionCard, PERMISSION_GROUPS } from '../Atoms';
import apiClient from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';

// ============================================
// ASSIGNED AREAS CARD
// ============================================
// AgentAssigned.tsx - Updated AssignedAreasCard

// AgentAssigned.tsx - Updated AssignedAreasCard with duplicate prevention

// AgentAssigned.tsx - Fixed version with proper state management

// AgentAssigned.tsx - Refactored Child Component (No API calls)

export function AssignedAreasCard({ agent, onSave, disabled = false }) {
  const { toast } = useToast();
  // Get operator's localities from Redux store
  const user = useSelector((state) => state?.auth?.user);
  const operatorLocalities = user?.localities || [];

  const [selectedAreas, setSelectedAreas] = useState(
    new Set(agent.assignedAreas || agent.areas || []),
  );
  const [dirty, setDirty] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSaving, setLocalSaving] = useState(false);

  // Available localities = operator's assigned localities only
  const availableLocalities = operatorLocalities;

  // Filtered localities based on search
  const filteredLocalities = availableLocalities.filter((locality) =>
    locality.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Toggle a single area
  const toggleArea = (locality) => {
    if (localSaving || disabled) return;
    setSelectedAreas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locality)) {
        newSet.delete(locality);
      } else {
        newSet.add(locality);
      }
      return newSet;
    });
    setDirty(true);
  };

  // Toggle all areas in a group
  const toggleGroup = (groupLocalities) => {
    if (localSaving || disabled) return;
    const allSelected = groupLocalities.every((loc) => selectedAreas.has(loc));
    setSelectedAreas((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        groupLocalities.forEach((loc) => newSet.delete(loc));
      } else {
        groupLocalities.forEach((loc) => newSet.add(loc));
      }
      return newSet;
    });
    setDirty(true);
  };

  // Select/Deselect all
  const toggleAll = () => {
    if (localSaving || disabled) return;
    if (selectedAreas.size === availableLocalities.length) {
      setSelectedAreas(new Set());
    } else {
      setSelectedAreas(new Set(availableLocalities));
    }
    setDirty(true);
  };

  // Handle save - just call parent's onSave function
  const handleSave = async () => {
    if (localSaving || disabled) {
      console.log('Save already in progress');
      return;
    }

    if (!agent._id && !agent.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Agent ID not found',
      });
      return;
    }

    try {
      setLocalSaving(true);

      const areasArray = Array.from(selectedAreas);

      // Call parent's save function - parent handles the API call
      await onSave(areasArray);

      // If we get here, save was successful
      setDirty(false);
    } catch (error: any) {
      // Error is already handled by parent's toast
      console.error('Save failed:', error);
    } finally {
      setLocalSaving(false);
    }
  };

  // Reset selected areas when agent changes
  useEffect(() => {
    const agentAreas = agent.assignedAreas || agent.areas || [];
    console.log('Agent changed, resetting areas:', agentAreas);
    setSelectedAreas(new Set(agentAreas));
    setDirty(false);
  }, [agent._id, agent.id, agent.assignedAreas, agent.areas]);

  const totalSelected = selectedAreas.size;
  const totalAvailable = availableLocalities.length;

  return (
    <SectionCard
      title="Assigned Collection Areas"
      icon={MapPin}
      description={`${totalSelected} of ${totalAvailable} areas assigned — agent can only access customers in selected areas`}
      action={
        dirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={localSaving || disabled}
            className="gap-1.5 h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
          >
            {localSaving ? (
              <>
                <RefreshCw size={11} className="animate-spin mr-1" /> Saving...
              </>
            ) : (
              <>
                <Check size={11} className="mr-1" /> Save Changes
              </>
            )}
          </Button>
        )
      }
    >
      {/* Selection summary and controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">
            {totalSelected} of {totalAvailable} areas selected
          </span>
          {totalSelected > 0 && totalAvailable > 0 && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((totalSelected / totalAvailable) * 100)}%
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAll}
          className="h-7 text-xs"
          disabled={totalAvailable === 0 || disabled || localSaving}
        >
          {totalSelected === totalAvailable ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search localities..."
          className="pl-9 h-9 text-sm"
          disabled={disabled || localSaving}
        />
      </div>

      {/* Localities list with checkboxes */}
      {totalAvailable === 0 ? (
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              No localities assigned to you
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Please contact your administrator to get localities assigned to
              your account.
            </p>
          </div>
        </div>
      ) : filteredLocalities.length === 0 ? (
        <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <Search size={16} className="text-slate-400 shrink-0" />
          <p className="text-sm text-slate-500">
            No localities found matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
          {filteredLocalities.map((locality) => (
            <label
              key={locality}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group border border-transparent hover:border-slate-100 ${
                disabled || localSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div
                onClick={() =>
                  !disabled && !localSaving && toggleArea(locality)
                }
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selectedAreas.has(locality)
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-white border-slate-300 group-hover:border-slate-400'
                }`}
              >
                {selectedAreas.has(locality) && (
                  <Check size={10} className="text-white" />
                )}
              </div>

              <div
                className="flex-1 min-w-0"
                onClick={() =>
                  !disabled && !localSaving && toggleArea(locality)
                }
              >
                <span className="text-sm text-slate-700">{locality}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Warning when no areas selected */}
      {totalSelected === 0 && totalAvailable > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              No areas selected
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Agent will not be able to access any customers until areas are
              assigned.
            </p>
          </div>
        </div>
      )}

      {/* Currently assigned areas summary */}
      {!dirty && (agent.assignedAreas || agent.areas || []).length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mb-2">
            Currently Assigned (
            {(agent.assignedAreas || agent.areas || []).length}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(agent.assignedAreas || agent.areas || [])
              .slice(0, 5)
              .map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                >
                  <MapPin size={10} />
                  {area}
                </span>
              ))}
            {(agent.assignedAreas || agent.areas || []).length > 5 && (
              <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
                +{(agent.assignedAreas || agent.areas || []).length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Unsaved changes indicator */}
      {dirty && !localSaving && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Info size={13} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            You have unsaved changes. Click "Save Changes" to apply.
          </p>
        </div>
      )}
    </SectionCard>
  );
}
// ============================================
// PERMISSIONS CARD
// ============================================

export function PermissionsCard({ agent, onSave, disabled = false }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState(new Set(agent.permissions || []));
  const [localSaving, setLocalSaving] = useState(false); // Renamed from saving to localSaving
  const [dirty, setDirty] = useState(false);

  const toggle = (id) => {
    if (disabled || localSaving) return; // Added localSaving check
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setDirty(true);
  };

  const toggleGroup = (groupPerms) => {
    if (disabled || localSaving) return; // Added localSaving check
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
    if (localSaving || disabled) {
      // Changed from saving to localSaving
      console.log('Save already in progress');
      return;
    }

    if (!agent._id && !agent.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Agent ID not found',
      });
      return;
    }

    try {
      setLocalSaving(true); // Changed from setSaving to setLocalSaving

      const permissionsArray = [...selected];

      // Call parent's save function - parent handles the API call
      await onSave(permissionsArray);

      // If we get here, save was successful
      setDirty(false);
    } catch (error: any) {
      // Error is already handled by parent's toast
      console.error('Save failed:', error);
    } finally {
      setLocalSaving(false); // Changed from setSaving to setLocalSaving
    }
  };

  // Reset selected permissions when agent changes
  useEffect(() => {
    const agentPermissions = agent.permissions || [];
    setSelected(new Set(agentPermissions));
    setDirty(false);
  }, [agent._id, agent.id, agent.permissions]);

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
            disabled={localSaving || disabled} // Changed from saving to localSaving
            className="gap-1.5 h-7 text-xs bg-slate-900 hover:bg-slate-700 text-white"
          >
            {localSaving ? ( // Changed from saving to localSaving
              <>
                <RefreshCw size={11} className="animate-spin mr-1" /> Saving...
              </>
            ) : (
              <>
                <Check size={11} className="mr-1" /> Save
              </>
            )}
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {Object.entries(PERMISSION_GROUPS).map(([group, perms], idx, arr) => {
          const ids = perms.map((p) => p.id);
          const allIn = ids.every((id) => selected.has(id));
          const someIn = ids.some((id) => selected.has(id));
          const count = ids.filter((id) => selected.has(id)).length;

          return (
            <div key={group}>
              <div
                className={`flex items-center justify-between mb-2 ${
                  !disabled && !localSaving
                    ? 'cursor-pointer'
                    : 'cursor-default' // Added localSaving check
                }`}
                onClick={() => !disabled && !localSaving && toggleGroup(perms)} // Added localSaving check
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
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors group ${
                      disabled || localSaving
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer' // Added localSaving check
                    }`}
                  >
                    <div
                      onClick={() =>
                        !disabled && !localSaving && toggle(perm.id)
                      } // Added localSaving check
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
                      onClick={() =>
                        !disabled && !localSaving && toggle(perm.id)
                      } // Added localSaving check
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

              {idx < arr.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}
      </div>

      {dirty &&
        !localSaving && ( // Added !localSaving condition
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
