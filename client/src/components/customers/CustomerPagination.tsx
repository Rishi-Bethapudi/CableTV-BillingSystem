'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CustomerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CustomerPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).slice(0, 5); // Shows first 5 pages, you can enhance this to show sliding window

  return (
    <div className="mt-4 flex justify-between items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex gap-1">
        {visiblePages.map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        {totalPages > 5 && (
          <span className="text-sm text-muted-foreground px-2">
            … {totalPages}
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
