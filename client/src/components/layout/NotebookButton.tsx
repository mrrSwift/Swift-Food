// src/components/layout/NotebookButton.tsx
import { ShoppingBasket } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { Notebook } from '../notebook/Notebook';
import { motion, AnimatePresence } from 'framer-motion';

export const NotebookButton = () => {
  const notebook = useStore(state => state.notebook);
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = notebook.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative hover:bg-white/20"
      >
        <ShoppingBasket className="w-5 h-5" />
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <Notebook onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};