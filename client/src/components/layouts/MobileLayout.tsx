// src/components/layouts/MobileLayout.tsx
import { useState } from 'react';
import { useLayout } from './LayoutContext';
import { BottomNavBar } from './BottomNavBar';
import { Sidebar } from '../Sidebar'; // We'll reuse the same sidebar component
import { Menu, Search, Bell, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { headerActions } = useLayout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Handlers for Header Icons ---
  const handleSearchClick = () =>
    toast.info('Search functionality coming soon!');
  const handleNotificationsClick = () =>
    toast.info('Notifications panel coming soon!');
  const handleProfileClick = () => toast.info('Profile page coming soon!');

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
        {/* Hamburger Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1" />

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {headerActions}
          <Button variant="ghost" size="icon" onClick={handleSearchClick}>
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationsClick}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleProfileClick}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto  pb-20">{children}</main>

      {/* --- Bottom Navigation --- */}
      <BottomNavBar />

      {/* --- Hamburger Sidebar (Drawer) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Sidebar Content */}
          <div className="w-64 bg-background border-r">
            {/* <div className="flex items-center justify-between p-2 border-b">
              <h2 className="font-bold text-lg px-2">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div> */}
            {/* We can reuse the same Sidebar component for a consistent menu */}
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => setIsSidebarOpen(false)} // Close sidebar on nav item click
            />
          </div>
          {/* Overlay to close sidebar when clicking outside */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
