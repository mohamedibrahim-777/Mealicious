import { create } from 'zustand'
import { adminFetch } from './admin-fetch'
import { type Product, type Category } from './data'

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
  orders: AdminOrder[]
  users: AdminUser[]
  subscribers: AdminSubscriber[]
  messages: AdminMessage[]
  dashboard: DashboardSummary | null
  loading: boolean
  error: string | null

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
  deleteOrder: (orderNumber: string) => Promise<void>

  updateUserRole: (id: string, role: AdminUser['role']) => Promise<void>
  deleteUser: (id: string) => Promise<void>

  markMessageRead: (id: string, isRead?: boolean) => Promise<void>
  deleteMessage: (id: string) => Promise<void>

  resetCatalog: () => Promise<void>
}

import { categories as seedCategories } from './data'

export const useCatalogStore = create<CatalogStore>()((set, get) => ({
  products: [],
  categories: seedCategories, // categories rarely change; keep static for selectors
  orders: [],
  users: [],
  subscribers: [],
  messages: [],
  dashboard: null,
  loading: false,
  error: null,

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
  deleteOrder: async (orderNumber) => {
    await adminFetch(`/api/admin/orders/${orderNumber}`, { method: 'DELETE' })
    await get().loadOrders()
  },

  updateUserRole: async (id, role) => {
    await adminFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) })
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

  resetCatalog: async () => {
    await get().loadAll()
  },
}))
