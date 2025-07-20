import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Box, HandCoins } from 'lucide-react';

const navItems = [
  { to: '/products', icon: <Box size={20} />, label: 'Products' },
  { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
  { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/collection', icon: <HandCoins size={20} />, label: 'Collections' },
];

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="grid h-16 max-w-lg grid-cols-4 mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `inline-flex flex-col items-center justify-center gap-1.5 p-2 text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
