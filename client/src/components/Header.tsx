// src/components/Header.tsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '@/components/layouts/LayoutContext';
import { usePlatform } from '@/hooks/usePlatform';
import { Menu, Search, Bell, User, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar'; // Assuming you have a Sidebar component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { isNative } = usePlatform();
  const { headerTitle, headerActions } = useLayout();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- Web Header ---
  const WebHeader = () => (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{headerTitle}</h1>
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers, products..." className="pl-10" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  // --- Mobile Header ---
  const MobileHeader = () => (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background px-4">
        {/* Use a Sheet component for the hamburger menu drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold">{headerTitle}</h1>

        <div className="flex items-center gap-1">
          {headerActions}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Search Modal/Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center border-b p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(false)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Input
              autoFocus
              placeholder="Search anything..."
              className="flex-1 border-none focus-visible:ring-0 text-base"
            />
          </div>
          <div className="p-6 text-center text-muted-foreground">
            Start typing to see results.
          </div>
        </div>
      )}
    </>
  );

  // Render the correct header based on the platform
  return isNative ? <MobileHeader /> : <WebHeader />;
}
