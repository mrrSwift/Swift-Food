// src/pages/CustomerMenuPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { Banner } from '../components/menu/Banner';
import { CategorySlider } from '../components/menu/CategorySlider';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { MenuItemDetail } from '../components/menu/MenuItemDetail';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { MenuItem, Category } from '../types';

export default function CustomerMenuPage() {
  const { restaurantId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const setSelectedRestaurant = useStore(state => state.setSelectedRestaurant);
  const setRestaurantTheme = useStore(state => state.setRestaurantTheme);

  useEffect(() => {
    if (restaurantId) {
      loadMenu(restaurantId);
    }
  }, [restaurantId]);

  const loadMenu = async (id: string) => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        api.getRestaurant(id),
        api.getRestaurantMenu(id),
      ]);

      const restaurant = restaurantRes.data;
      setSelectedRestaurant(restaurant);
      setRestaurantTheme({
        brandColor: restaurant.brandColor || '#000',
        accentColor: restaurant.accentColor || '#000',
      });

      // Extract categories and items from menu response
      setCategories(menuRes.data.menu.map((m: any) => m.category));
      setMenuItems(menuRes.data.menu.flatMap((m: any) => m.items));
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category._id === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <Header />
      
      <main className="pb-20">
        <Banner />
        
        <div className="mt-4">
          <CategorySlider
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="px-4 mt-4">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items in this category</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedItem && (
          <MenuItemDetail
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}