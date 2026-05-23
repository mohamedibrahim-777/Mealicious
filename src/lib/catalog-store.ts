import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  products as seedProducts,
  categories as seedCategories,
  type Product,
  type Category,
} from './data'

export interface AdminOrder {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  date: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  joined: string
}

interface CatalogStore {
  products: Product[]
  categories: Category[]
  orders: AdminOrder[]
  users: AdminUser[]

  addProduct: (p: Product) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void

  addOrder: (o: AdminOrder) => void
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void
  deleteOrder: (id: string) => void

  addUser: (u: AdminUser) => void
  updateUserRole: (id: string, role: AdminUser['role']) => void
  deleteUser: (id: string) => void

  resetCatalog: () => void
}

const seedOrders: AdminOrder[] = [
  { id: 'MEA-1042', customer: 'Aarav Sharma', email: 'aarav@example.com', items: 3, total: 1499, status: 'Shipped', date: '2026-05-19' },
  { id: 'MEA-1041', customer: 'Priya Singh', email: 'priya@example.com', items: 1, total: 799, status: 'Processing', date: '2026-05-20' },
  { id: 'MEA-1040', customer: 'Rahul Verma', email: 'rahul@example.com', items: 5, total: 2399, status: 'Delivered', date: '2026-05-14' },
  { id: 'MEA-1039', customer: 'Neha Patel', email: 'neha@example.com', items: 2, total: 549, status: 'Pending', date: '2026-05-21' },
  { id: 'MEA-1038', customer: 'Karthik Iyer', email: 'karthik@example.com', items: 4, total: 1899, status: 'Delivered', date: '2026-05-10' },
]

const seedUsers: AdminUser[] = [
  { id: 'u-1', name: 'Admin', email: 'admin@mealicious.com', role: 'admin', joined: '2026-01-01' },
  { id: 'u-2', name: 'Aarav Sharma', email: 'aarav@example.com', role: 'user', joined: '2026-02-12' },
  { id: 'u-3', name: 'Priya Singh', email: 'priya@example.com', role: 'user', joined: '2026-03-04' },
  { id: 'u-4', name: 'Rahul Verma', email: 'rahul@example.com', role: 'user', joined: '2026-03-21' },
  { id: 'u-5', name: 'Neha Patel', email: 'neha@example.com', role: 'user', joined: '2026-04-08' },
]

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      categories: seedCategories,
      orders: seedOrders,
      users: seedUsers,

      addProduct: (p) => set({ products: [p, ...get().products] }),
      updateProduct: (id, patch) =>
        set({ products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      deleteProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),

      addOrder: (o) => set({ orders: [o, ...get().orders] }),
      updateOrderStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
      deleteOrder: (id) => set({ orders: get().orders.filter((o) => o.id !== id) }),

      addUser: (u) => set({ users: [u, ...get().users] }),
      updateUserRole: (id, role) =>
        set({ users: get().users.map((u) => (u.id === id ? { ...u, role } : u)) }),
      deleteUser: (id) => set({ users: get().users.filter((u) => u.id !== id) }),

      resetCatalog: () =>
        set({
          products: seedProducts,
          categories: seedCategories,
          orders: seedOrders,
          users: seedUsers,
        }),
    }),
    {
      name: 'mealicious-catalog',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        users: state.users,
      }),
    },
  ),
)
