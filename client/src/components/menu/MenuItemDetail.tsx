// src/components/menu/MenuItemDetail.tsx
import { X, Star, Clock, Leaf, Wheat, Flame } from 'lucide-react';
import { Button } from '../ui/button';
import { MenuItem } from '../../types';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MenuItemDetailProps {
  item: MenuItem;
  onClose: () => void;
}

export const MenuItemDetail = ({ item, onClose }: MenuItemDetailProps) => {
  const addToNotebook = useStore(state => state.addToNotebook);
  const notebook = useStore(state => state.notebook);
  
  const notebookItem = notebook.find(n => n.item._id === item._id);
  const price = item.discountPrice || item.price;

  const handleAddToNotebook = () => {
    addToNotebook({
      item,
      quantity: 1,
      addedAt: Date.now(),
    });
    toast.success(`${item.name} added to selection`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full sm:w-[500px] max-h-[90vh] glass-card rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* Image */}
        {item.image && (
          <div className="relative h-64">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto ios-scroll max-h-[calc(90vh-16rem)]">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-muted-foreground">{item.category.name}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">{item.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({item.totalRatings})
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6">{item.description}</p>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {item.isVegetarian && (
              <span className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm">
                <Leaf className="w-4 h-4 text-green-500" />
                Vegetarian
              </span>
            )}
            {item.isVegan && (
              <span className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm">
                <Leaf className="w-4 h-4 text-green-600" />
                Vegan
              </span>
            )}
            {item.isGlutenFree && (
              <span className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm">
                <Wheat className="w-4 h-4 text-amber-500" />
                Gluten Free
              </span>
            )}
            {item.spiceLevel && (
              <span className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm">
                <Flame className="w-4 h-4 text-red-500" />
                {item.spiceLevel}
              </span>
            )}
            {item.preparationTime && (
              <span className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm">
                <Clock className="w-4 h-4" />
                {item.preparationTime} min
              </span>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-1">
                {item.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary rounded-full text-xs"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-red-500">Allergens</h3>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              {item.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
              )}
            </div>
            {notebookItem && (
              <span className="text-sm text-muted-foreground">
                {notebookItem.quantity} in selection
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddToNotebook}
              disabled={!item.isAvailable}
            >
              {item.isAvailable ? 'Add to Selection' : 'Currently Unavailable'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};