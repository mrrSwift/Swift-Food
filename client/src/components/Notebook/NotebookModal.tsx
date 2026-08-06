// client/src/components/Notebook/NotebookModal.tsx
import { useState, useEffect, useCallback } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  readNotebook,
  writeNotebook,
  setNotebookItemQuantity,
  clearNotebook,
  notebookTotal,
  Notebook,
} from "@/lib/notebook";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";

interface NotebookModalProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}
const isValidPhone = (phone: string): boolean => {
  // Iranian mobile: 09 followed by 9 digits
  const iranMobile = /^09\d{9}$/;
  // International: + followed by 7-15 digits
  const international = /^\+\d{7,15}$/;
  return iranMobile.test(phone) || international.test(phone);
};

export function NotebookModal({
  restaurantId,
  isOpen,
  onClose,
}: NotebookModalProps) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"dine-in" | "delivery">(
    "dine-in"
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { t } = useLocale();

  function price(price: number) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + t("common.currency")
    );
  }

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

  const handleQuantityChange = useCallback(
    (menuItemId: string, newQuantity: number) => {
      if (!notebook) return;
      const updated = setNotebookItemQuantity(
        notebook,
        menuItemId,
        newQuantity
      );
      writeNotebook(updated);
      setNotebook(updated);
      if (newQuantity === 0) toast.success(t("notebook.removedToast"));
    },
    [notebook]
  );

  const validatePhone = (value: string) => {
    setPhoneNumber(value);
    if (value.trim() === "") {
      setPhoneError("");
      return;
    }
    if (!isValidPhone(value.trim())) {
      setPhoneError(t('notebook.invalidPhone')+" (e.g. 09123456789 or +1234567890)");
    } else {
      setPhoneError("");
    }
  };
  
  const handleClear = useCallback(() => {
    clearNotebook();
    setNotebook(null);
    toast.success(t("notebook.clearedToast"));
  }, []);

  const total = notebookTotal(notebook);

  const handleSubmitOrder = async () => {
    const orderType = deliveryOption;
    if (!notebook || notebook.items.length === 0) return;
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      toast.error(t("notebook.errAddress"));
      return;
    }
    // Validate phone if provided
    if (phoneNumber.trim() !== "" && !isValidPhone(phoneNumber.trim())) {
      toast.error(t('notebook.invalidPhone')+" (e.g. 09123456789 or +1234567890)");
      return;
    }
    setSubmitting(true);
    try {
      const orderRes = await api.createOrder({
        restaurantId,
        items: notebook.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: customerName.trim() || undefined,
        tableNumber: orderType === "dine-in" ? tableNumber.trim() : undefined,
        notes: notes.trim() || undefined,
        deliveryOption: orderType,
        phone: phoneNumber,
        deliveryAddress:
          orderType === "delivery" ? deliveryAddress.trim() : undefined,
      });

      if (orderType === "delivery") {
        // Determine gateway – here we default to Zarinpal
        const orderId = orderRes._id;
        if (orderId) {
          const method = import.meta.env.VITE_PAYMENT_METHOD;
          api
            .initiatePayment({
              orderId,
              method,
            })
            .then(async res => {
              clearNotebook();
              setNotebook(null);
              if (res.redirectUrl) {
                window.location.href = res.redirectUrl; // Zarinpal redirect
              } else if (res.sessionUrl) {
                // Stripe: open Stripe Elements or redirect to Checkout page
                // For simplicity, we can use Stripe Checkout redirection
                window.location.href = res.sessionUrl;
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      } else {
        // Dine‑in – clear notebook and close
        clearNotebook();
        setNotebook(null);
        toast.success(t("notebook.orderPlaced"));
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || t("notebook.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md max-h-[85vh] glass-card bg-white/30 rounded-t-3xl sm:rounded-3xl overflow-hidden mx-0 sm:mx-4 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                <h2 className="font-semibold text-lg">
                  {t("restaurant.yourSelection")}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!notebook || notebook.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingBag className="size-12 mb-3 opacity-40" />
                  <p className="text-base">{t("restaurant.noItems")}</p>
                  <p className="text-sm">{t("restaurant.tapAdd")}</p>
                </div>
              ) : (
                <>
                  {notebook.items.map(item => (
                    <motion.div
                      key={item.menuItemId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="glass rounded-2xl p-4 flex gap-4"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {price(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              handleQuantityChange(
                                item.menuItemId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              handleQuantityChange(
                                item.menuItemId,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 shrink-0 self-start"
                        onClick={() => handleQuantityChange(item.menuItemId, 0)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </motion.div>
                  ))}

                  {/* Customer info + order type */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    {/* Order type */}
                    <label className="text-sm font-medium">
                      {t("restaurant.orderType")}
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          deliveryOption === "dine-in" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDeliveryOption("dine-in")}
                      >
                        {t("restaurant.dineIn")}
                      </Button>
                      <Button
                        variant={
                          deliveryOption === "delivery" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDeliveryOption("delivery")}
                      >
                        {t("restaurant.delivery")}
                      </Button>
                    </div>

                    {deliveryOption === "delivery" && (
                      <Input
                        placeholder={t("restaurant.deliveryAddress")}
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        className="bg-white/50"
                        required
                      />
                    )}

                    <Input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder={t("restaurant.yourName")}
                      required
                      className="bg-white/50"
                    />
                    <Input
                      value={phoneNumber}
                      onChange={e => validatePhone(e.target.value)}
                      placeholder={t("restaurant.phone")}
                      required
                      className="bg-white/50"
                    />
                    {deliveryOption === "dine-in" && (
                      <Input
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        placeholder={t("restaurant.tableNumber")}
                        className="bg-white/50"
                        required
                      />
                    )}

                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder={t("restaurant.specialNotes")}
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
                  <span>{t("restaurant.total")}</span>
                  <span>{price(total)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClear}
                    disabled={submitting}
                  >
                    {t("restaurant.clearAll")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block size-4 border-2 border-white/30 border-t-white rounded-full" />{" "}
                        {t("restaurant.placing")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="size-4" /> {t("restaurant.placeOrder")}
                      </span>
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
