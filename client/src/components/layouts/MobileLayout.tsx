import { useState } from 'react';
import { useLayout } from './LayoutContext';
import { BottomNavBar } from './BottomNavBar';
import { Sidebar } from '../Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { headerActions } = useLayout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
        {/* Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="flex-1 font-semibold text-lg">Cable</div>

        {/* Dynamic header actions */}
        {headerActions && (
          <div className="flex items-center gap-1">{headerActions}</div>
        )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* --- Bottom Navigation --- */}
      <BottomNavBar />

      {/* --- Sidebar Drawer --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-50 bg-background border-r">
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => setIsSidebarOpen(false)}
            />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
