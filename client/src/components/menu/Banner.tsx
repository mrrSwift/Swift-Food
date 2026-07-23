// src/components/menu/Banner.tsx
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const Banner = () => {
  const { selectedRestaurant } = useStore();

  if (!selectedRestaurant?.coverImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mx-4 mt-20"
    >
      <img
        src={selectedRestaurant.coverImage}
        alt={selectedRestaurant.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
        <p className="text-sm opacity-90 mt-1">{selectedRestaurant.description}</p>
      </div>
    </motion.div>
  );
};