
import { useState } from 'react';
import { Clock3, ChevronDown, ChevronUp } from 'lucide-react';

interface OpeningHour {
  day: string;
  open: string;
  close: string;
}

interface OpeningHoursProps {
  openingHours: OpeningHour[];
}

export function OpeningHours({ openingHours }: OpeningHoursProps) {
  const [showAll, setShowAll] = useState(false);
  
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find today's hours
  const todayHours = openingHours.find(
    hour => hour.day.toLowerCase() === today
  );

  // Check if currently open
  const isOpen = todayHours ? (() => {
    const [openHour, openMinute] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    // Handle overnight hours (e.g., 22:00 - 02:00)
    if (closeTime <= openTime) {
      return currentTime >= openTime || currentTime < closeTime;
    }
    
    return currentTime >= openTime && currentTime < closeTime;
  })() : false;

  return (
    <div className="space-y-2">
      {/* Current Status */}
      <div className="flex items-center gap-2">
        <Clock3 className="size-4 text-muted-foreground" />
        
        <div className="flex items-center gap-2">
          {/* Today's Hours */}
          {todayHours ? (
            <span className="text-sm">
              <span className="font-medium capitalize">{today}</span>
              {' '}{todayHours.open} – {todayHours.close}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              No hours available
            </span>
          )}
          
          {/* Open/Close Badge */}
          {todayHours && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              isOpen 
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
            }`}>
              <span className={`size-1.5 rounded-full ${
                isOpen ? 'bg-emerald-500' : 'bg-red-500'
              } ${isOpen ? 'animate-pulse' : ''}`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          )}
        </div>

        {/* Toggle All Days */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {/* All Days (Collapsible) */}
      {showAll && (
        <div className="pl-6 space-y-1 animate-fade-in">
          {openingHours.map((hour) => {
            const isToday = hour.day.toLowerCase() === today;
            const isActive = isToday && isOpen;
            
            return (
              <div
                key={hour.day}
                className={`flex items-center justify-between text-sm px-2 py-1 rounded-md ${
                  isToday 
                    ? 'bg-accent font-medium' 
                    : 'text-muted-foreground'
                }`}
              >
                <span className="capitalize flex items-center gap-2">
                  {hour.day}
                  {isToday && (
                    <span className={`size-1.5 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                  )}
                </span>
                <span>{hour.open} – {hour.close}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}