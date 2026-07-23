// src/components/owner/OwnerHeader.tsx
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface OwnerHeaderProps {
  onMenuClick: () => void;
}

export const OwnerHeader = ({ onMenuClick }: OwnerHeaderProps) => {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass backdrop-blur-xl border-b border-white/20 px-4 lg:px-6 h-16 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white/50"
            />
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
};