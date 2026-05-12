import { Eye, LogIn, User } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Agent {
  _id: string;

  name: string;

  mobile: string;

  employeeCode?: string;

  status: string;

  totalCollection: number;

  monthlyCollection: number;

  todaysCollection: number;
}

interface Props {
  agents: Agent[];
}

export default function AgentTable({ agents }: Props) {
  const navigate = useNavigate();

  /*
  =============================================================================
  STATUS COLORS
  =============================================================================
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';

      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';

      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /*
  =============================================================================
  LOGIN AS AGENT
  =============================================================================
  */

  const handleLoginAsAgent = (agentId: string) => {
    window.open(`/agent-login/${agentId}`, '_blank');
  };

  /*
  =============================================================================
  EMPTY STATE
  =============================================================================
  */

  if (!agents.length) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />

          <h3 className="text-lg font-semibold">No agents found</h3>

          <p className="text-muted-foreground mt-1">
            No agents match the selected filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="transition-all duration-200">
      <Card>
        <CardContent className="p-0">
          {/* DESKTOP */}

          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.no</TableHead>

                  <TableHead>Name</TableHead>

                  <TableHead>Mobile</TableHead>

                  <TableHead>Total Collection</TableHead>

                  <TableHead>Monthly Collection</TableHead>

                  <TableHead>Today's Collection</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {agents.map((agent, index) => (
                  <TableRow
                    key={agent._id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell>{index + 1}</TableCell>

                    {/* NAME */}

                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(`/operators/agents/${agent._id}`)
                        }
                        className="text-left"
                      >
                        <div className="font-medium hover:text-primary hover:underline transition-colors">
                          {agent.name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {agent.employeeCode}
                        </div>
                      </button>
                    </TableCell>

                    {/* MOBILE */}

                    <TableCell>{agent.mobile}</TableCell>

                    {/* TOTAL */}

                    <TableCell>
                      ₹{agent.totalCollection.toLocaleString()}
                    </TableCell>

                    {/* MONTH */}

                    <TableCell>
                      ₹{agent.monthlyCollection.toLocaleString()}
                    </TableCell>

                    {/* TODAY */}

                    <TableCell>
                      ₹{agent.todaysCollection.toLocaleString()}
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/operators/agents/${agent._id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleLoginAsAgent(agent._id)}
                        >
                          <LogIn className="h-4 w-4 mr-1" />
                          Login
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE */}

          <div className="lg:hidden p-4 space-y-4">
            {agents.map((agent) => (
              <Card key={agent._id} className="transition-all duration-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() =>
                          navigate(`/operators/agents/${agent._id}`)
                        }
                        className="font-semibold hover:text-primary hover:underline transition-colors"
                      >
                        {agent.name}
                      </button>

                      <p className="text-sm text-muted-foreground">
                        {agent.mobile}
                      </p>
                    </div>

                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>

                      <p className="font-medium">
                        ₹{agent.totalCollection.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Monthly</p>

                      <p className="font-medium">
                        ₹{agent.monthlyCollection.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Today</p>

                      <p className="font-medium">
                        ₹{agent.todaysCollection.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/operators/agents/${agent._id}`)}
                    >
                      Details
                    </Button>

                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleLoginAsAgent(agent._id)}
                    >
                      Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
