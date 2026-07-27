// src/components/menu/CategoryHeader.tsx
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryHeaderProps {
  name: string;
  description?: string;
  iconName?: string;
  itemCount?: number;
  className?: string;
}

export function CategoryHeader({
  name,
  description,
  iconName,
  itemCount,
  className,
}: CategoryHeaderProps) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      {/* Icon */}
      <CategoryIcon
        iconName={iconName}
        size="lg"
        variant="default"
      />

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            {name}
          </h2>
          {itemCount !== undefined && (
            <span className="text-sm text-slate-400">
              ({itemCount})
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}