import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  UserCheck,
  CreditCard,
  FileText,
  MessageSquare,
  Receipt,
  ChevronLeft,
  Settings,
  Cable,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Agents', href: '/agents', icon: UserCheck },
  { name: 'Collection', href: '/collection', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'bg-slate-900 text-white transition-all duration-300 flex flex-col h-full md:h-screen fixed md:relative z-50',
        isCollapsed ? 'w-16' : 'w-50'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cable className="h-8 w-8 text-blue-400" />
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold">CableTV</h1>
                <p className="text-xs text-slate-400">BillDesk Pro</p>
              </div>
            )}
          </div>
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-slate-700">
        <Link
          to="/settings"
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Settings</span>}
        </Link>
      </div>
    </div>
  );
}
