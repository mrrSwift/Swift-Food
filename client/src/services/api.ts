// src/services/api.ts
import { useStore } from '../store/useStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getHeaders(isFormData = false): HeadersInit {
    const state = useStore.getState();
    const headers: HeadersInit = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (state.auth.token) {
      headers['Authorization'] = `Bearer ${state.auth.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(options.body instanceof FormData),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Public Customer APIs
  async getRestaurants(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customer/restaurants${query ? `?${query}` : ''}`);
  }

  async getRestaurant(id: string) {
    return this.request(`/customer/restaurants/${id}`);
  }

  async getRestaurantMenu(id: string) {
    return this.request(`/customer/restaurants/${id}/menu`);
  }

  async searchMenuItems(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customer/menu-items/search${query ? `?${query}` : ''}`);
  }

  async getMenuItem(id: string) {
    return this.request(`/customer/menu-items/${id}`);
  }

  // Restaurant Owner APIs
  async getMyRestaurants() {
    return this.request('/restaurant/restaurants');
  }

  async createRestaurant(data: any) {
    return this.request('/restaurant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(data: any) {
    return this.request('/restaurant', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getRestaurantOverview(restaurantId: string) {
    return this.request(`/restaurant/restaurants/${restaurantId}/overview`);
  }

  // Category Management
  async getCategories() {
    return this.request('/restaurant/categories');
  }

  async createCategory(data: any) {
    return this.request('/restaurant/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/restaurant/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/restaurant/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu Item Management
  async getMenuItems(categoryId?: string) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request(`/restaurant/menu-items${query}`);
  }

  async createMenuItem(data: any) {
    return this.request('/restaurant/menu-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/restaurant/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/restaurant/menu-items/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleMenuItemAvailability(id: string) {
    return this.request(`/restaurant/menu-items/${id}/toggle-availability`, {
      method: 'PUT',
    });
  }

  // Image Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiService();