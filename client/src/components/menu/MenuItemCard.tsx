// src/components/menu/MenuItemCard.tsx
import { Plus, Star, Clock, Leaf, Wheat } from 'lucide-react';
import { Button } from '../ui/button';
import { MenuItem } from '../../types';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

export const MenuItemCard = ({ item, onClick }: MenuItemCardProps) => {
  const addToNotebook = useStore(state => state.addToNotebook);

  const handleAddToNotebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToNotebook({
      item,
      quantity: 1,
      addedAt: Date.now(),
    });
    toast.success(`${item.name} added to selection`);
  };

  const price = item.discountPrice || item.price;
  const hasDiscount = !!item.discountPrice;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Image */}
      {item.image && (
        <div className="relative h-40">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SALE
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight flex-1">{item.name}</h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          {item.isVegetarian && <Leaf className="w-3 h-3 text-green-500" />}
          {item.isGlutenFree && <Wheat className="w-3 h-3 text-amber-500" />}
          {item.preparationTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {item.preparationTime}min
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold">${price.toFixed(2)}</span>
            )}
          </div>

          <Button
            variant="glass"
            size="icon"
            onClick={handleAddToNotebook}
            disabled={!item.isAvailable}
            className="rounded-full w-10 h-10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};