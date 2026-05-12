import { useEffect, useMemo, useState } from 'react';

import apiClient from '@/utils/apiClient';
import AgentForm from '@/components/agent/AgentForm';

import AgentFilters from '@/components/agent/AgentFilters';

import AgentTable from '@/components/agent/AgentTable';

import { Card, CardContent } from '@/components/ui/card';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Agent {
  _id: string;

  name: string;

  email?: string;

  mobile: string;

  employeeCode?: string;

  status: string;

  totalCollection: number;

  monthlyCollection: number;

  todaysCollection: number;
}

export default function Agents() {
  /*
  =============================================================================
  STATES
  =============================================================================
  */

  const [agents, setAgents] = useState<Agent[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /*
  =============================================================================
  FETCH AGENTS
  =============================================================================
  */

  const fetchAgents = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get('/operators/agents');

      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('FETCH AGENTS ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
  =============================================================================
  INITIAL FETCH
  =============================================================================
  */

  useEffect(() => {
    fetchAgents();
  }, []);

  /*
  =============================================================================
  FILTERED AGENTS
  =============================================================================
  */

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        agent.name?.toLowerCase().includes(search) ||
        agent.mobile?.includes(searchTerm) ||
        agent.email?.toLowerCase().includes(search) ||
        agent.employeeCode?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' ? true : agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchTerm, statusFilter]);

  /*
  =============================================================================
  PAGINATION
  =============================================================================
  */

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedAgents = filteredAgents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /*
  =============================================================================
  FILTER HANDLERS
  =============================================================================
  */

  const clearFilters = () => {
    setSearchTerm('');

    setStatusFilter('all');

    setCurrentPage(1);
  };

  /*
  =============================================================================
  LOADING STATE
  =============================================================================
  */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-muted rounded animate-pulse" />

            <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({
              length: 5,
            }).map((_, i) => (
              <div key={i} className="h-14 rounded bg-muted animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /*
  =============================================================================
  PAGE
  =============================================================================
  */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>

          <p className="text-muted-foreground mt-1">
            Manage your field workforce ({filteredAgents.length} of{' '}
            {agents.length})
          </p>
        </div>

        <AgentForm onAgentCreated={fetchAgents} />
      </div>

      {/* FILTERS */}

      <AgentFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={(value) => {
          setSearchTerm(value);

          setCurrentPage(1);
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);

          setCurrentPage(1);
        }}
        onClearFilters={clearFilters}
      />

      {/* TABLE */}

      <AgentTable agents={paginatedAgents} />

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredAgents.length)} of{' '}
            {filteredAgents.length} agents
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>

              {Array.from({
                length: totalPages,
              }).map((_, index) => {
                const page = index + 1;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();

                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
