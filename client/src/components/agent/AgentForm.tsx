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
    mode: 'onChange', // This enables real-time validation
    reValidateMode: 'onChange', // Re-validate on change
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

      // Handle specific API error messages
      const errorMessage =
        error?.response?.data?.message || 'Failed to create agent';

      // Check for specific error conditions from API
      if (errorMessage.includes('Agent limit')) {
        toast({
          variant: 'destructive',
          title: 'Agent Limit Reached',
          description: errorMessage,
        });
      } else if (
        errorMessage.includes('Password must be at least 8 characters')
      ) {
        form.setError('password', {
          type: 'manual',
          message: 'Password must be at least 8 characters',
        });
        toast({
          variant: 'destructive',
          title: 'Validation Failed',
          description: errorMessage,
        });
      } else if (
        errorMessage.includes('Name, mobile and password are required')
      ) {
        toast({
          variant: 'destructive',
          title: 'Missing Fields',
          description: errorMessage,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile number validation pattern (10 digits)
  const mobilePattern = /^[0-9]{10}$/;

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
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must not exceed 50 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Name should only contain letters and spaces',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ramesh"
                        {...field}
                        autoComplete="off"
                      />
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
                  pattern: {
                    value: mobilePattern,
                    message: 'Mobile number must be 10 digits',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        type="tel"
                        {...field}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
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
                rules={{
                  required: 'Role is required',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
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
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                maxLength: {
                  value: 20,
                  message: 'Password must not exceed 20 characters',
                },
                // pattern: {
                //   value:
                //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                //   message:
                //     'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                // },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button disabled until form is valid */}
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
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
