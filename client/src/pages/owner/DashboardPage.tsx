// src/pages/owner/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  Tags, 
  Star,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { useStore } from '../../store/useStore';
import { OwnerSidebar } from '../../components/owner/OwnerSidebar';
import { OwnerHeader } from '../../components/owner/OwnerHeader';
import { cn } from '../../lib/utils';

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const selectedRestaurant = useStore(state => state.selectedRestaurant);

  useEffect(() => {
    if (selectedRestaurant) {
      loadOverview(selectedRestaurant._id);
    }
  }, [selectedRestaurant]);

  const loadOverview = async (id: string) => {
    try {
      const response = await api.getRestaurantOverview(id);
      setOverview(response.data);
    } catch (error) {
      console.error('Failed to load overview:', error);
    }
  };

  const stats = [
    {
      label: 'Total Categories',
      value: overview?.stats.categories || 0,
      icon: Tags,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Menu Items',
      value: overview?.stats.totalItems || 0,
      icon: Package,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Available Items',
      value: overview?.stats.availableItems || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Rating',
      value: overview?.stats.rating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      suffix: `(${overview?.stats.totalRatings || 0})`,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <OwnerSidebar />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <OwnerHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Welcome back, {selectedRestaurant?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your restaurant today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-r text-white",
                    stat.color
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="glass"
                className="justify-start gap-3"
                onClick={() => {/* Navigate to add menu item */}}
              >
                <Plus className="w-4 h-4" />
                Add Menu Item
              </Button>
              <Button
                variant="glass"
                className="justify-start gap-3"
                onClick={() => {/* Navigate to edit restaurant */}}
              >
                <Edit className="w-4 h-4" />
                Edit Restaurant
              </Button>
              <Button
                variant="glass"
                className="justify-start gap-3"
                onClick={() => {/* Preview menu */}}
              >
                <Eye className="w-4 h-4" />
                Preview Menu
              </Button>
            </div>
          </div>

          {/* Restaurant Info */}
          {overview?.restaurant && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Restaurant Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{overview.restaurant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{overview.restaurant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{overview.restaurant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{overview.restaurant.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuisine</p>
                  <p className="font-medium">{overview.restaurant.cuisine.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                    overview.restaurant.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}>
                    {overview.restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}