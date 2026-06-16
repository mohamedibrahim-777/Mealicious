import { create } from 'zustand'
import { adminFetch } from './admin-fetch'
import { products as seedProducts, categories as seedCategories, type Product, type Category } from './data'

export interface AdminOrder {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Confirmed'
  date: string
  dbId?: string
  paymentStatus?: string
  paymentMethod?: string | null
  shippingAddr?: Record<string, unknown>
  itemDetails?: unknown[]
  subtotal?: number
  shipping?: number
  tax?: number
  discount?: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  joined: string
  orderCount?: number
  phone?: string | null
}

export interface AdminSubscriber { id: string; email: string; createdAt: string }
export interface AdminMessage {
  id: string; name: string; email: string; phone: string | null;
  subject: string; message: string; isRead: boolean; createdAt: string
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
}

export interface AdminCoupon {
  id: string
  code: string
  discount: number
  status: 'active' | 'inactive'
  // Note: Database stores type, value, minOrder, maxDiscount, usageLimit, usedCount, validFrom, validTo, isActive
  // but admin UI simplified to core 3 fields per spec (code, discount, status)
}

export interface AdminBanner {
  id: string
  title: string
  subtitle?: string
  image: string
  link: string
  sortOrder: number
  isActive: boolean
}

export interface AdminBlog {
  id: string
  title: string
  excerpt: string
  published: boolean
}

export interface AdminReview {
  id: string
  productName: string
  rating: number
  status: 'approved' | 'pending' | 'rejected'
}

export interface DashboardSummary {
  counts: {
    products: number; orders: number; users: number;
    subscribers: number; messages: number; unreadMessages: number;
    lowStockProducts: number
  }
  revenue: number
  recentOrders: { id: string; customer: string; total: number; status: string; date: string }[]
}

interface CatalogStore {
  products: Product[]
  categories: Category[]
  adminCategories: AdminCategory[]
  coupons: AdminCoupon[]
  banners: AdminBanner[]
  blogs: AdminBlog[]
  reviews: AdminReview[]
  orders: AdminOrder[]
  users: AdminUser[]
  subscribers: AdminSubscriber[]
  messages: AdminMessage[]
  dashboard: DashboardSummary | null
  loading: boolean
  error: string | null

  loadPublicProducts: () => Promise<void>
  loadAll: () => Promise<void>
  loadProducts: () => Promise<void>
  loadOrders: () => Promise<void>
  loadUsers: () => Promise<void>
  loadSubscribers: () => Promise<void>
  loadMessages: () => Promise<void>
  loadDashboard: () => Promise<void>

  addProduct: (p: Partial<Product>) => Promise<void>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  updateOrderStatus: (orderNumber: string, status: AdminOrder['status']) => Promise<void>
  updateOrder: (orderNumber: string, patch: Partial<AdminOrder>) => Promise<void>
  deleteOrder: (orderNumber: string) => Promise<void>

  updateUserRole: (id: string, role: AdminUser['role']) => Promise<void>
  updateUser: (id: string, patch: Partial<AdminUser>) => Promise<void>
  deleteUser: (id: string) => Promise<void>

  markMessageRead: (id: string, isRead?: boolean) => Promise<void>
  deleteMessage: (id: string) => Promise<void>

  loadCategories: () => Promise<void>
  addCategory: (category: Partial<AdminCategory>) => Promise<void>
  updateCategory: (id: string, patch: Partial<AdminCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  loadCoupons: () => Promise<void>
  addCoupon: (coupon: Partial<AdminCoupon>) => Promise<void>
  updateCoupon: (id: string, patch: Partial<AdminCoupon>) => Promise<void>
  deleteCoupon: (id: string) => Promise<void>

  loadBanners: () => Promise<void>
  addBanner: (banner: Partial<AdminBanner>) => Promise<void>
  updateBanner: (id: string, patch: Partial<AdminBanner>) => Promise<void>
  deleteBanner: (id: string) => Promise<void>

  loadBlogs: () => Promise<void>
  addBlog: (blog: Partial<AdminBlog>) => Promise<void>
  updateBlog: (id: string, patch: Partial<AdminBlog>) => Promise<void>
  deleteBlog: (id: string) => Promise<void>

  loadReviews: () => Promise<void>
  addReview: (review: Partial<AdminReview>) => Promise<void>
  updateReview: (id: string, patch: Partial<AdminReview>) => Promise<void>
  deleteReview: (id: string) => Promise<void>

  resetCatalog: () => Promise<void>
}

export const useCatalogStore = create<CatalogStore>()((set, get) => ({
  products: seedProducts,
  categories: seedCategories,
  adminCategories: [],
  coupons: [],
  banners: [],
  blogs: [],
  reviews: [],
  orders: [],
  users: [],
  subscribers: [],
  messages: [],
  dashboard: null,
  loading: false,
  error: null,

  loadPublicProducts: async () => {
    try {
      const res = await fetch('/api/products')
      const data = (await res.json()) as { products?: Product[] }
      if (Array.isArray(data.products) && data.products.length > 0) {
        set({ products: data.products })
      }
    } catch {
      // Keep seed fallback
    }
  },

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      await Promise.all([
        get().loadProducts(),
        get().loadOrders(),
        get().loadUsers(),
        get().loadSubscribers(),
        get().loadMessages(),
        get().loadDashboard(),
      ])
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  loadProducts: async () => {
    const data = await adminFetch<{ products: Product[] }>('/api/admin/products')
    set({ products: data.products })
  },
  loadOrders: async () => {
    const data = await adminFetch<{ orders: AdminOrder[] }>('/api/admin/orders')
    set({ orders: data.orders })
  },
  loadUsers: async () => {
    const data = await adminFetch<{ users: AdminUser[] }>('/api/admin/users')
    set({ users: data.users })
  },
  loadSubscribers: async () => {
    const data = await adminFetch<{ subscribers: AdminSubscriber[] }>('/api/admin/subscribers')
    set({ subscribers: data.subscribers })
  },
  loadMessages: async () => {
    const data = await adminFetch<{ messages: AdminMessage[] }>('/api/admin/messages')
    set({ messages: data.messages })
  },
  loadCategories: async () => {
    const data = await adminFetch<{ categories: AdminCategory[] }>('/api/admin/categories')
    set({ adminCategories: data.categories })
  },
  loadDashboard: async () => {
    const data = await adminFetch<DashboardSummary>('/api/admin/dashboard')
    set({ dashboard: data })
  },

  addProduct: async (p) => {
    await adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(p) })
    await get().loadProducts()
  },
  updateProduct: async (id, patch) => {
    await adminFetch(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadProducts()
  },
  deleteProduct: async (id) => {
    await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await get().loadProducts()
  },

  updateOrderStatus: async (orderNumber, status) => {
    await adminFetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: status.toLowerCase() }),
    })
    await get().loadOrders()
  },
  updateOrder: async (orderNumber, patch: Partial<AdminOrder>) => {
    const data: Record<string, unknown> = {}
    if (patch.customer !== undefined) data.customer = patch.customer
    if (patch.email !== undefined) data.email = patch.email
    if (patch.total !== undefined) data.total = patch.total
    if (patch.status !== undefined) data.status = patch.status.toLowerCase()
    if (patch.items !== undefined) data.items = patch.items
    await adminFetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    await get().loadOrders()
  },
  deleteOrder: async (orderNumber) => {
    await adminFetch(`/api/admin/orders/${orderNumber}`, { method: 'DELETE' })
    await get().loadOrders()
  },

  updateUserRole: async (id, role) => {
    await adminFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) })
    await get().loadUsers()
  },
  updateUser: async (id, patch: Partial<AdminUser>) => {
    const data: Record<string, unknown> = {}
    if (patch.name !== undefined) data.name = patch.name
    if (patch.phone !== undefined) data.phone = patch.phone
    if (patch.role !== undefined) data.role = patch.role
    await adminFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    await get().loadUsers()
  },
  deleteUser: async (id) => {
    await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await get().loadUsers()
  },

  markMessageRead: async (id, isRead = true) => {
    await adminFetch(`/api/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead }) })
    await get().loadMessages()
  },
  deleteMessage: async (id) => {
    await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    await get().loadMessages()
  },

  addCategory: async (category) => {
    await adminFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify(category) })
    await get().loadCategories()
  },
  updateCategory: async (id, patch) => {
    await adminFetch(`/api/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadCategories()
  },
  deleteCategory: async (id) => {
    await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    await get().loadCategories()
  },

  loadCoupons: async () => {
    const data = await adminFetch<{ coupons: AdminCoupon[] }>('/api/admin/coupons')
    set({ coupons: data.coupons })
  },
  addCoupon: async (coupon) => {
    await adminFetch('/api/admin/coupons', { method: 'POST', body: JSON.stringify(coupon) })
    await get().loadCoupons()
  },
  updateCoupon: async (id, patch) => {
    await adminFetch(`/api/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadCoupons()
  },
  deleteCoupon: async (id) => {
    await adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    await get().loadCoupons()
  },

  loadBanners: async () => {
    const data = await adminFetch<{ banners: AdminBanner[] }>('/api/admin/banners')
    set({ banners: data.banners })
  },
  addBanner: async (banner) => {
    await adminFetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(banner) })
    await get().loadBanners()
  },
  updateBanner: async (id, patch) => {
    await adminFetch(`/api/admin/banners/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadBanners()
  },
  deleteBanner: async (id) => {
    await adminFetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    await get().loadBanners()
  },

  loadBlogs: async () => {
    const data = await adminFetch<{ blogs: AdminBlog[] }>('/api/admin/blogs')
    set({ blogs: data.blogs })
  },
  addBlog: async (blog) => {
    await adminFetch('/api/admin/blogs', { method: 'POST', body: JSON.stringify(blog) })
    await get().loadBlogs()
  },
  updateBlog: async (id, patch) => {
    await adminFetch(`/api/admin/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadBlogs()
  },
  deleteBlog: async (id) => {
    await adminFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
    await get().loadBlogs()
  },

  loadReviews: async () => {
    const data = await adminFetch<{ reviews: AdminReview[] }>('/api/admin/reviews')
    set({ reviews: data.reviews })
  },
  addReview: async (review) => {
    await adminFetch('/api/admin/reviews', { method: 'POST', body: JSON.stringify(review) })
    await get().loadReviews()
  },
  updateReview: async (id, patch) => {
    await adminFetch(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await get().loadReviews()
  },
  deleteReview: async (id) => {
    await adminFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    await get().loadReviews()
  },

  resetCatalog: async () => {
    await get().loadAll()
  },
}))
