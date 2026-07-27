// src/components/menu/CategoryIcon.tsx
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
interface CategoryIconProps {
  iconName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "outline" | "filled" | "ghost";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "p-1.5 rounded-lg",
    icon: "size-3.5",
  },
  md: {
    container: "p-2 rounded-xl",
    icon: "size-5",
  },
  lg: {
    container: "p-2.5 rounded-xl",
    icon: "size-6",
  },
  xl: {
    container: "p-3 rounded-2xl",
    icon: "size-8",
  },
};

const variantClasses = {
  default: "bg-slate-100 text-slate-700",
  outline: "border-2 border-slate-200 text-slate-700",
  filled: "bg-slate-900 text-white",
  ghost: "bg-transparent text-slate-500",
};

export function CategoryIcon({
  iconName = "UtensilsCrossed",
  size = "md",
  variant = "default",
  className,
}: CategoryIconProps) {
  const Icon = getCategoryIcon(iconName);
  const sizes = sizeClasses[size];

  return (
        <motion.div
      animate={{
        scale:  1,
        rotate:  0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        sizes.container,
        variantClasses[variant],
        className
      )}
    >
      <Icon className={sizes.icon} />
    </div>
    </motion.div>
  );
}