
import { Plus, MoreHorizontal, User, Phone, Mail, Home, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from 'lucide-react';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  agent_code: string;
  commission_rate: number;
  status: string;
  hire_date: string;
}

interface AgentTableProps {
  agents: Agent[];
  searchTerm: string;
  statusFilter: string;
}

export default function AgentTable({ agents, searchTerm, statusFilter }: AgentTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const clearFilters = () => {
    // This will be handled by parent component
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {agents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                          <div className="text-sm text-slate-500">{agent.agent_code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{agent.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{agent.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{agent.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {agent.commission_rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">
                          {new Date(agent.hire_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No agents found
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or clear filters.'
                  : 'Get started by adding your first agent.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="mr-2">
                  Clear Filters
                </Button>
              )}
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
