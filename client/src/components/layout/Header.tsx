// src/components/layout/Header.tsx
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { NotebookButton } from './NotebookButton';

export const Header = () => {
  const { selectedRestaurant, toggleSidebar, restaurantTheme } = useStore();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className="glass backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {selectedRestaurant?.logo ? (
                <img
                  src={selectedRestaurant.logo}
                  alt={selectedRestaurant.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: restaurantTheme?.brandColor || '#000' }}
                >
                  {selectedRestaurant?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <h1 className="text-sm font-semibold leading-tight">
                  {selectedRestaurant?.name || 'Restaurant'}
                </h1>
                {selectedRestaurant && (
                  <p className="text-xs text-muted-foreground">
                    {selectedRestaurant.cuisine?.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotebookButton />
            {!useStore.getState().auth.isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Owner Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};