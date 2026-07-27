// src/components/owner/IconPicker.tsx
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { categoryIcons, type IconName } from '@/lib/categoryIcons';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value = 'UtensilsCrossed', onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIcon = categoryIcons.find(i => i.name === value);
  const filteredIcons = categoryIcons.filter(i => 
    i.label.toLowerCase().includes(search.toLowerCase()) ||
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="text-sm font-medium mb-2 block">Category Icon</label>
      
      {/* Selected Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent transition-colors"
      >
        {selectedIcon && (
          <>
            <selectedIcon.icon className="size-5" />
            <span className="text-sm flex-1 text-left">{selectedIcon.label}</span>
          </>
        )}
        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border shadow-lg max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Icon Grid */}
          <div className="p-2 grid grid-cols-4 gap-1 overflow-y-auto max-h-48">
            {filteredIcons.map((item) => {
              const isSelected = value === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title={item.label}
                >
                  <item.icon className="size-5" />
                  <span className="truncate w-full text-center">{item.label}</span>
                  {isSelected && <Check className="size-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Close on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}