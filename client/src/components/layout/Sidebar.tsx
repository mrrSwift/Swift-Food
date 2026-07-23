// src/components/layout/Sidebar.tsx
import { useEffect } from 'react';
import { X, LogIn, Store, Tag, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const { isSidebarOpen, setSidebarOpen, selectedRestaurant, auth } = useStore();
  const navigate = useNavigate();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setSidebarOpen]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50"
          >
            <div className="h-full glass backdrop-blur-2xl border-r border-white/20 p-6 flex flex-col">
              {/* Close button */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Restaurant Info */}
              {selectedRestaurant && (
                <div className="glass-card rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedRestaurant.logo ? (
                      <img
                        src={selectedRestaurant.logo}
                        alt={selectedRestaurant.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedRestaurant.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        ⭐ {selectedRestaurant.rating.toFixed(1)} ({selectedRestaurant.totalRatings})
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>📍 {selectedRestaurant.address}</p>
                    <p>📞 {selectedRestaurant.phone}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-base"
                  onClick={() => {
                    navigate('/');
                    setSidebarOpen(false);
                  }}
                >
                  <Home className="w-5 h-5" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-base"
                  onClick={() => {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                    setSidebarOpen(false);
                  }}
                >
                  <Tag className="w-5 h-5" />
                  Categories
                </Button>
              </nav>

              {/* Login Button */}
              <div className="pt-4 border-t border-white/20">
                {auth.isAuthenticated ? (
                  <Button
                    variant="glass"
                    className="w-full gap-2"
                    onClick={() => {
                      navigate('/dashboard');
                      setSidebarOpen(false);
                    }}
                  >
                    <Store className="w-4 h-4" />
                    Owner Panel
                  </Button>
                ) : (
                  <Button
                    variant="glass"
                    className="w-full gap-2"
                    onClick={() => {
                      navigate('/login');
                      setSidebarOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Restaurant Owner Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};