// src/components/layout/Footer.tsx
import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Footer = () => {
  const { selectedRestaurant } = useStore();

  if (!selectedRestaurant) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = selectedRestaurant.openingHours?.find(h => h.day === today);

  return (
    <footer className="mt-auto border-t border-white/20">
      <div className="glass-card rounded-t-3xl p-6 space-y-6">
        {/* Logo and Name */}
        <div className="flex items-center gap-3">
          {selectedRestaurant.logo ? (
            <img
              src={selectedRestaurant.logo}
              alt={selectedRestaurant.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
              {selectedRestaurant.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{selectedRestaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisine.join(', ')}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{selectedRestaurant.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{selectedRestaurant.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{selectedRestaurant.email}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {todayHours ? `${todayHours.open} - ${todayHours.close}` : 'Closed'}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-white/20">
          <p>© 2024 {selectedRestaurant.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};