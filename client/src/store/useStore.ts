// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, NotebookItem, Restaurant } from '../types';

interface AppStore {
  // Auth
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;

  // Notebook
  notebook: NotebookItem[];
  addToNotebook: (item: NotebookItem) => void;
  removeFromNotebook: (itemId: string) => void;
  updateNotebookQuantity: (itemId: string, quantity: number) => void;
  clearNotebook: () => void;

  // Restaurant Selection
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Restaurant Theme
  restaurantTheme: {
    brandColor: string;
    accentColor: string;
  } | null;
  setRestaurantTheme: (theme: { brandColor: string; accentColor: string } | null) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
      },
      setAuth: (auth) => set({ auth }),
      logout: () => set({
        auth: { user: null, token: null, isAuthenticated: false },
        selectedRestaurant: null,
      }),

      // Notebook
      notebook: [],
      addToNotebook: (item) => {
        const existing = get().notebook.find(n => n.item._id === item.item._id);
        if (existing) {
          set({
            notebook: get().notebook.map(n =>
              n.item._id === item.item._id
                ? { ...n, quantity: n.quantity + item.quantity }
                : n
            ),
          });
        } else {
          set({ notebook: [...get().notebook, item] });
        }
      },
      removeFromNotebook: (itemId) => {
        set({ notebook: get().notebook.filter(n => n.item._id !== itemId) });
      },
      updateNotebookQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromNotebook(itemId);
          return;
        }
        set({
          notebook: get().notebook.map(n =>
            n.item._id === itemId ? { ...n, quantity } : n
          ),
        });
      },
      clearNotebook: () => set({ notebook: [] }),

      // Restaurant
      selectedRestaurant: null,
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

      // UI
      isSidebarOpen: false,
      toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Theme
      restaurantTheme: null,
      setRestaurantTheme: (theme) => set({ restaurantTheme: theme }),
    }),
    {
      name: 'restaurant-app-storage',
      partialize: (state) => ({
        auth: state.auth,
        notebook: state.notebook,
        selectedRestaurant: state.selectedRestaurant,
      }),
    }
  )
);