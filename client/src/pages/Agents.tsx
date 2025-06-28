
import { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import AgentForm from '@/components/AgentForm';
import AgentFilters from '@/components/AgentFilters';
import AgentTable from '@/components/AgentTable';

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*');

    if (error) {
      console.error('Error fetching agents:', error);
    } else {
      setAgents(data || []);
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone.includes(searchTerm) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Agents</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your agents and their details ({filteredAgents.length} agents)
          </p>
        </div>
        <AgentForm onAgentCreated={fetchAgents} />
      </div>

      {/* Search and Filters */}
      <AgentFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Agent Table */}
      <AgentTable
        agents={paginatedAgents}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAgents.length)} of {filteredAgents.length} agents
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <PaginationItem key={page}>...</PaginationItem>;
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
