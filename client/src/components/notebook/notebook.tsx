// src/components/notebook/Notebook.tsx
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

interface NotebookProps {
  onClose: () => void;
}

export const Notebook = ({ onClose }: NotebookProps) => {
  const { notebook, updateNotebookQuantity, removeFromNotebook, clearNotebook } = useStore();

  const total = notebook.reduce((sum, item) => {
    const price = item.item.discountPrice || item.item.price;
    return sum + (price * item.quantity);
  }, 0);

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
        className="relative w-full sm:w-96 max-h-[80vh] glass-card rounded-t-3xl sm:rounded-3xl overflow-hidden mx-0 sm:mx-4"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Selection</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto ios-scroll mb-6">
            {notebook.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBasketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items selected yet</p>
                <p className="text-sm">Add items from the menu</p>
              </div>
            ) : (
              notebook.map((notebookItem) => (
                <motion.div
                  key={notebookItem.item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex gap-3">
                    {notebookItem.item.image && (
                      <img
                        src={notebookItem.item.image}
                        alt={notebookItem.item.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{notebookItem.item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${((notebookItem.item.discountPrice || notebookItem.item.price) * notebookItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => updateNotebookQuantity(notebookItem.item._id, notebookItem.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{notebookItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => updateNotebookQuantity(notebookItem.item._id, notebookItem.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromNotebook(notebookItem.item._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {notebook.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearNotebook}
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Show to waiter - you can implement this
                    onClose();
                  }}
                >
                  Show to Waiter
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Missing icon component
const ShoppingBasketIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);