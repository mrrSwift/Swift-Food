// src/components/owner/OwnerSidebar.tsx
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Menu, 
  Tags, 
  Settings, 
  LogOut, 
  Store,
  Plus 
} from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Store, label: 'My Restaurants', path: '/dashboard/restaurants' },
  { icon: Menu, label: 'Menu Items', path: '/dashboard/menu' },
  { icon: Tags, label: 'Categories', path: '/dashboard/categories' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export const OwnerSidebar = () => {
  const { selectedRestaurant, logout, auth } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 glass border-r border-white/20 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          {selectedRestaurant?.logo ? (
            <img
              src={selectedRestaurant.logo}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-sm">
              {selectedRestaurant?.name || 'Owner Panel'}
            </h2>
            <p className="text-xs text-muted-foreground">{auth.user?.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'glass' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "shadow-lg"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Add Restaurant Button */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="glass"
          className="w-full gap-2 mb-2"
          onClick={() => navigate('/dashboard/restaurants/new')}
        >
          <Plus className="w-4 h-4" />
          Add Restaurant
        </Button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};