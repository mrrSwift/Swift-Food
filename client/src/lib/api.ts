const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

export type UserRole = "admin" | "r_owner" | "customer";
export type User = { id: string; name: string; email: string; role: UserRole };
export type OpeningHour = { day: string; open: string; close: string };
export type Order = {
  _id?: string;
  restaurantId: string;
  items: { menuItemId: string; quantity: number; price: number }[];
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  phone: string;
  orderType: "dine_in" | "delivery";
  deliveryAddress?: string;
};
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
export type OwnerRequest = {
  name: string;
  email: string;
  password: string;
  description: string;
  phone: string;
  restaurantName: string;
  status: string;
  adminNotes: string;
};

export type Theme = {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  accentColor: string;
  foreground: string;
  border: string;
};

export type Restaurant = {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  cuisine: string[];
  openingHours: OpeningHour[];
  theme: Theme;
  isActive: boolean;
  rating: number;
  totalRatings: number;
};
export type Category = {
  _id?: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
};
export type MenuItem = {
  _id?: string;
  category: string | { _id: string; name: string };
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  ingredients?: string;
  allergens?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel?: string;
  preparationTime?: number;
  isAvailable: boolean;
  order?: number;
  rating?: number;
  totalRatings?: number;
};

export type Overview = {
  categories: number;
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
  rating: number;
  totalRatings: number;
  totalOrders: number; // 🆕
  pendingOrders: number; // 🆕
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function token() {
  return localStorage.getItem("restaurant-token");
}
async function request<T>(
  path: string,
  init: RequestInit = {},
  skipContentType?: boolean
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(skipContentType ? {} : { "Content-Type": "application/json" }),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success)
    throw new ApiError(body.message ?? "Request failed", response.status);
  return body.data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  uploadImage: (formData: FormData) =>
    request<{ url: string }>(
      "/api/restaurant/upload",
      {
        method: "POST",
        body: formData,
      },
      true
    ),
  me: () => request<{ user: User }>("/api/auth/me"),
  restaurants: (search = "") =>
    request<{ restaurants: Restaurant[] }>(
      `/api/customer/restaurants?limit=50${search ? `&search=${encodeURIComponent(search)}` : ""}`
    ),
  publicRestaurant: (id: string) =>
    request<Restaurant>(`/api/customer/restaurants/${id}`),
  publicMenu: (id: string) =>
    request<{
      restaurant: Pick<Restaurant, "_id" | "name" | "description">;
      menu: {
        category: {
          id: string;
          name: string;
          description?: string;
          icon?: string;
        };
        items: MenuItem[];
      }[];
    }>(`/api/customer/restaurants/${id}/menu`),
  myRestaurants: () =>
    request<{
      restaurants: Restaurant[];
      maxRestaurants: number;
      remaining: number;
    }>("/api/restaurant/all"),
  myRestaurant: (id: string) => request<Restaurant>(`/api/restaurant/${id}`),
  myRestaurantOverView: (id: string) =>
    request<Overview>(`/api/restaurant/${id}/overview`),
  createRestaurant: (
    data: Pick<
      Restaurant,
      | "name"
      | "description"
      | "address"
      | "phone"
      | "email"
      | "website"
      | "cuisine"
      | "theme"
      | "openingHours"
    >
  ) =>
    request<Restaurant>("/api/restaurant", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRestaurant: (id: string, data: Partial<Restaurant>) => {
    console.log(data);
    request<Restaurant>(`/api/restaurant/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  categories: (restaurantId: string) =>
    request<Category[]>(
      `/api/restaurant/categories?restaurantId=${restaurantId}`
    ),
  createCategory: (restaurantId: string, data: Category) =>
    request<Category>(
      `/api/restaurant/categories?restaurantId=${restaurantId}`,
      { method: "POST", body: JSON.stringify(data) }
    ),
  updateCategory: (
    restaurantId: string,
    id: string,
    data: Partial<
      Pick<Category, "name" | "description" | "order" | "image" | "icon">
    >
  ) =>
    request<Category>(
      `/api/restaurant/categories/${id}?restaurantId=${restaurantId}`,
      { method: "PUT", body: JSON.stringify(data) }
    ),
  deleteCategory: (restaurantId: string, id: string) =>
    request<void>(
      `/api/restaurant/categories/${id}?restaurantId=${restaurantId}`,
      { method: "DELETE" }
    ),
  menuItems: (restaurantId: string) =>
    request<MenuItem[]>(
      `/api/restaurant/menu-items?restaurantId=${restaurantId}`
    ),
  createMenuItem: (restaurantId: string, data: MenuItem) =>
    request<MenuItem>(
      `/api/restaurant/menu-items?restaurantId=${restaurantId}`,
      { method: "POST", body: JSON.stringify(data) }
    ),
  updateMenuItem: (restaurantId: string, id: string, data: Partial<MenuItem>) =>
    request<MenuItem>(
      `/api/restaurant/menu-items/${id}?restaurantId=${restaurantId}`,
      { method: "PUT", body: JSON.stringify(data) }
    ),
  deleteMenuItem: (restaurantId: string, id: string) =>
    request<void>(
      `/api/restaurant/menu-items/${id}?restaurantId=${restaurantId}`,
      { method: "DELETE" }
    ),
  toggleMenuItem: (id: string) =>
    request<MenuItem>(`/api/restaurant/menu-items/${id}/toggle-availability`, {
      method: "PUT",
    }),
  createOrder: (data: Order) =>
    request<Order>("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  initiatePayment: (data: { orderId: string; method: string, }) =>
    request<{success:boolean; redirectUrl?:string; sessionId?:string, sessionUrl?:string}>("/api/payment/initiate", { method: "POST", body: JSON.stringify(data) }),
  verifyPayment: (url:string ) =>
    request<{success:boolean, refId:string}>(url),

  // Owner: Get orders for a restaurant
  getOrders: (
    restaurantId: string,
    params?: { status?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return request<{ orders: any }>(
      `/api/orders/restaurant/${restaurantId}${qs ? `?${qs}` : ""}`
    );
  },

  // Owner: Get single order
  getOrder: (orderId: string) => request(`/orders/${orderId}`),
  post: (url: string, data: any) =>
    request(url, { method: "POST", body: JSON.stringify(data) }),
  // Owner: Update order status
  updateOrderStatus: (orderId: string, status: string) =>
    request(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  admin: {
    getUsers: (params?: { role?: string }) =>
      request<{ users: User[]; pagination: Pagination }>(
        `/api/admin/users${params ? `?role=${params.role}` : ""}`
      ),
    updateUser: (id: string, data: any) =>
      request<User>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteUser: (id: string) =>
      request(`/api/admin/users/${id}`, { method: "DELETE" }),
    getRestaurants: (params?: { isActive?: boolean }) => {
      const query =
        params?.isActive !== undefined ? `?isActive=${params.isActive}` : "";
      return request<{ restaurants: Restaurant[]; pagination: Pagination }>(
        `/api/admin/restaurants${query}`
      );
    },
    updateRestaurantStatus: (id: string, isActive: boolean) =>
      request<Restaurant>(`/api/admin/restaurants/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      }),
    deleteRestaurant: (id: string) =>
      request(`/api/admin/restaurants/${id}`, { method: "DELETE" }),
    getOwnerRequests: (status?: string) =>
      request<OwnerRequest[]>(
        `/api/owner-requests${status ? `?status=${status}` : ""}`
      ),
    acceptOwnerRequest: (id: string, notes?: string) =>
      request(`/api/owner-requests/${id}/accept`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes: notes || "" }),
      }),
    declineOwnerRequest: (id: string, notes?: string) =>
      request(`/api/owner-requests/${id}/decline`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes: notes || "" }),
      }),
  },
};
