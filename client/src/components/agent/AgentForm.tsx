import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { UserPlus, RefreshCw } from 'lucide-react';

import apiClient from '@/utils/apiClient';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';

interface AgentFormProps {
  onAgentCreated?: () => void;
}

interface CreateAgentFormData {
  name: string;

  mobile: string;

  email?: string;

  password: string;

  role: string;
}

export default function AgentFormModal({ onAgentCreated }: AgentFormProps) {
  const navigate = useNavigate();

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAgentFormData>({
    defaultValues: {
      name: '',

      mobile: '',

      email: '',

      password: '',

      role: 'field_agent',
    },
  });

  /*
  =============================================================================
  SUBMIT
  =============================================================================
  */

  const handleSubmit = async (values: CreateAgentFormData) => {
    try {
      setIsSubmitting(true);

      const response = await apiClient.post('/operators/agents', values);

      toast({
        title: 'Agent Created',
        description: 'Agent created successfully',
      });

      setIsOpen(false);

      form.reset();

      onAgentCreated?.();

      navigate(`/operators/agents/${response.data.agent._id}`);
    } catch (error: any) {
      console.error(error);

      toast({
        variant: 'destructive',

        title: 'Creation Failed',

        description: error?.response?.data?.message || 'Failed to create agent',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>

          <DialogDescription>
            Quickly create a new field or collection agent.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}

              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: 'Name is required',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>

                    <FormControl>
                      <Input placeholder="Ramesh" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MOBILE */}

              <FormField
                control={form.control}
                name="mobile"
                rules={{
                  required: 'Mobile number is required',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>

                    <FormControl>
                      <Input placeholder="9876543210" type="tel" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="agent@gmail.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ROLE */}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="field_agent">Field Agent</SelectItem>

                        <SelectItem value="collection_agent">
                          Collection Agent
                        </SelectItem>

                        <SelectItem value="support_agent">
                          Support Agent
                        </SelectItem>

                        <SelectItem value="technical_agent">
                          Technical Agent
                        </SelectItem>

                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PASSWORD */}

            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'Password is required',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin mr-1.5" />{' '}
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
