// src/components/menu/AnimatedIcon.tsx
import { motion, easeInOut,  easeOut, easeIn, circInOut, backInOut } from "framer-motion";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  iconName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animation?: "pulse" | "bounce" | "shake" | "float" | "rotate" | "wiggle" | "glow";
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

export function CategoryIcon({
  iconName = "UtensilsCrossed",
  size = "md",
  animation = "pulse",
  color,
  className,
}: AnimatedIconProps) {
  const Icon = getCategoryIcon(iconName);

  const getAnimation = () => {
    switch (animation) {
      case "pulse":
        return {
          animate: {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: easeInOut,
          },
        };

      case "bounce":
        return {
          animate: {
            y: [0, -15, 0],
          },
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: easeOut,
          },
        };


      case "shake":
        return {
          animate: {
            rotate: [0, -10, 10, -10, 10, 0],
            x: [0, -3, 3, -3, 3, 0],
          },
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: easeInOut,
          },
        };

      case "float":
        return {
          animate: {
            y: [0, -10, 0],
            rotate: [0, -3, 0, 3, 0],
            scale: [1, 1.05, 1],
          },
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: circInOut,
          },
        };

      case "rotate":
        return {
          animate: {
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          },
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: easeInOut,
          },
        };

      case "wiggle":
        return {
          animate: {
            rotate: [0, 5, -5, 3, -3, 0],
            scale: [1, 1.05, 1, 1.05, 1],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: backInOut,
          },
        };

      case "glow":
        return {
          animate: {
            scale: [1, 1.1, 1],
            filter: [
              "drop-shadow(0 0 0px rgba(0,0,0,0))",
              "drop-shadow(0 0 8px rgba(99,102,241,0.5))",
              "drop-shadow(0 0 0px rgba(0,0,0,0))",
            ],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: easeInOut,
          },
        };

      default:
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: easeInOut,
          },
        };
    }
  };

  const animConfig = getAnimation();

  return (
    <motion.div
      animate={animConfig.animate}
      transition={animConfig.transition}
      style={color ? { color } : undefined}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Icon className={sizeMap[size]} />
    </motion.div>
  );
}