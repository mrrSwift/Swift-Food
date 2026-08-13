// apps/web/src/components/ui/Modal.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullscreen?: boolean;   // when true, the panel covers the whole viewport
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  fullscreen = false,
  className = "",
}: ModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center "
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className={`
              relative glass-card shadow-xl
              ${fullscreen ? "w-full h-full max-w-none rounded-none" : "rounded-3xl w-full max-w-md p-6 bg-white/40"}
              ${className}
            `}
          >
            {!fullscreen && (
              <div className="flex items-center justify-between mb-4">
                {title && (
                  <h2 className="font-display text-xl font-semibold">{title}</h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="ml-auto"
                >
                  <X className="size-5" />
                </Button>
              </div>
            )}
            {fullscreen && (
              <div className="h-full w-full p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  {title && (
                    <h2 className="font-display text-2xl font-semibold">{title}</h2>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="ml-auto"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                {children}
              </div>
            )}
            {!fullscreen && children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}