// hooks/useAgent.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { agentApi, agentKeys, Agent, AgentDetailsResponse } from '@/services/agent.service';

// Hook for fetching agent details
export function useAgent(agentId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: agentKeys.detail(agentId || ''),
    queryFn: () => {
      if (!agentId) throw new Error('Agent ID is required');
      return agentApi.getAgentById(agentId);
    },
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error Loading Agent',
        description: error?.response?.data?.message || 'Failed to load agent details',
      });
    },
  });
}

// Hook for updating agent profile
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.updateAgent,
    onSuccess: (data, variables) => {
      // Invalidate and refetch agent details
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update profile',
      });
    },
  });
}

// Hook for updating permissions
export function useUpdatePermissions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.updatePermissions,
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        agentKeys.detail(variables.id),
        (oldData: AgentDetailsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            agent: {
              ...oldData.agent,
              permissions: variables.permissions,
            },
          };
        }
      );
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      
      toast({
        title: 'Success',
        description: 'Permissions saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to save permissions',
      });
    },
  });
}

// Hook for updating areas
export function useUpdateAreas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.updateAreas,
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        agentKeys.detail(variables.id),
        (oldData: AgentDetailsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            agent: {
              ...oldData.agent,
              assignedAreas: variables.areas,
            },
          };
        }
      );
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      
      toast({
        title: 'Success',
        description: 'Areas updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update areas',
      });
    },
  });
}

// Hook for updating status
export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      
      toast({
        title: 'Success',
        description: variables.status === 'active' 
          ? 'Agent activated successfully' 
          : 'Agent suspended successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Status Update Failed',
        description: error?.response?.data?.message || 'Failed to update agent status',
      });
    },
  });
}

// Hook for resetting password
export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.resetPassword,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset email sent successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error?.response?.data?.message || 'Failed to reset password',
      });
    },
  });
}

// Hook for impersonating agent
export function useImpersonateAgent() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.impersonate,
    onSuccess: (data) => {
      const { token, redirectUrl } = data;
      
      if (token) {
        localStorage.setItem('impersonationToken', token);
        localStorage.setItem('originalUser', 'true');
      }
      
      toast({
        title: 'Success',
        description: 'Logged in as agent — opening agent dashboard',
      });
      
      // Redirect after a small delay
      setTimeout(() => {
        window.location.href = redirectUrl || '/agent/dashboard';
      }, 500);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error?.response?.data?.message || 'Failed to login as agent',
      });
    },
  });
}

// Hook for force logout
export function useForceLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.forceLogout,
    onSuccess: (data, id) => {
      // Update online status in cache
      queryClient.setQueryData(
        agentKeys.detail(id),
        (oldData: AgentDetailsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            agent: {
              ...oldData.agent,
              online: false,
            },
          };
        }
      );
      
      toast({
        title: 'Success',
        description: 'Agent forcefully logged out',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error?.response?.data?.message || 'Failed to force logout',
      });
    },
  });
}

// Hook for deleting agent
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: agentApi.deleteAgent,
    onSuccess: (data, id) => {
      // Invalidate agents list
      queryClient.invalidateQueries({
        queryKey: agentKeys.lists(),
      });
      
      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error?.response?.data?.message || 'Failed to delete agent',
      });
    },
  });
}