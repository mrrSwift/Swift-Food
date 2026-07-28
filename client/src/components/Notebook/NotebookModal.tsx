// apps/web/src/components/Notebook/NotebookModal.tsx
import { useState, useEffect, useCallback } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  readNotebook,
  writeNotebook,
  setNotebookItemQuantity,
  clearNotebook,
  notebookTotal,
  Notebook,
} from '@/lib/notebook';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';

interface NotebookModalProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

function price(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' Toman';
}

export function NotebookModal({ restaurantId, isOpen, onClose }: NotebookModalProps) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const nb = readNotebook();
      if (nb?.restaurantId === restaurantId) {
        setNotebook(nb);
      } else {
        setNotebook(null);
      }
    }
  }, [isOpen, restaurantId]);

  const handleQuantityChange = useCallback((menuItemId: string, newQuantity: number) => {
    if (!notebook) return;
    const updated = setNotebookItemQuantity(notebook, menuItemId, newQuantity);
    writeNotebook(updated);
    setNotebook(updated);
    if (newQuantity === 0) toast.success('Item removed from note');
  }, [notebook]);

  const handleClear = useCallback(() => {
    clearNotebook();
    setNotebook(null);
    toast.success('Note cleared');
  }, []);

  const total = notebookTotal(notebook);

  const handleSubmitOrder = async () => {
    if (!notebook || notebook.items.length === 0) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        restaurantId,
        items: notebook.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: customerName.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      clearNotebook();
      setNotebook(null);
      toast.success('Order placed! The waiter will be with you shortly.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full sm:max-w-md max-h-[85vh] glass-card rounded-t-3xl sm:rounded-3xl overflow-hidden mx-0 sm:mx-4 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                <h2 className="font-semibold text-lg">Your Selection</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="size-5" /></Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!notebook || notebook.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingBag className="size-12 mb-3 opacity-40" />
                  <p className="text-base">No items added yet</p>
                  <p className="text-sm">Tap "Add to Note" on a menu item</p>
                </div>
              ) : (
                <>
                  {notebook.items.map(item => (
                    <motion.div key={item.menuItemId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass rounded-2xl p-4 flex gap-4">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{price(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleQuantityChange(item.menuItemId, item.quantity - 1)}><Minus className="size-3" /></Button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleQuantityChange(item.menuItemId, item.quantity + 1)}><Plus className="size-3" /></Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 shrink-0 self-start" onClick={() => handleQuantityChange(item.menuItemId, 0)}><Trash2 className="size-4" /></Button>
                    </motion.div>
                  ))}

                  {/* Customer info form */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <Input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="bg-white/50"
                    />
                    <Input
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="Table number (optional)"
                      className="bg-white/50"
                    />
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Special notes (optional)"
                      className="bg-white/50 min-h-[60px]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {notebook && notebook.items.length > 0 && (
              <div className="p-5 border-t border-white/20 space-y-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{price(total)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleClear} disabled={submitting}>Clear All</Button>
                  <Button className="flex-1" onClick={handleSubmitOrder} disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2"><span className="animate-spin inline-block size-4 border-2 border-white/30 border-t-white rounded-full" /> Placing…</span>
                    ) : (
                      <span className="flex items-center gap-2"><Send className="size-4" /> Place Order</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}