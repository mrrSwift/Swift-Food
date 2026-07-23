// src/components/menu/CategorySlider.tsx
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface CategorySliderProps {
  categories: Array<{ _id: string; name: string }>;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategorySlider = ({ categories, selectedCategory, onSelectCategory }: CategorySliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative px-4 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto ios-scroll py-2"
        >
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "glass hover:bg-white/30"
            )}
          >
            All
          </button>
          
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category._id
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:bg-white/30"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};