'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useCatalogStore, type AdminOrder, type AdminUser, type AdminCategory, type AdminCoupon, type AdminBanner, type AdminBlog, type AdminReview, type AdminInventory } from '@/lib/catalog-store'
import type { Product } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Shield,
  Package,
  Users,
  IndianRupee,
  ShoppingCart,
  Search,
  Star,
  Boxes,
  Pencil,
  Trash2,
  Plus,
  Eye,
  RotateCcw,
  Receipt,
} from 'lucide-react'

type Tab = 'overview' | 'products' | 'categories' | 'orders' | 'users' | 'messages' | 'subscribers' | 'banners' | 'coupons' | 'blog' | 'reviews' | 'inventory'

const ORDER_STATUSES: AdminOrder['status'][] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

export default function AdminPanel() {
  const { user, navigate } = useAppStore()
  const {
    products,
    categories,
    adminCategories,
    coupons,
    banners,
    blogs,
    reviews,
    inventory,
    orders,
    users,
    addProduct,
    updateProduct,
    deleteProduct,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    loadBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    loadBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    loadReviews,
    addReview,
    updateReview,
    deleteReview,
    loadInventory,
    addInventory,
    updateInventory,
    deleteInventory,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    updateUserRole,
    updateUser,
    deleteUser,
    resetCatalog,
    loadAll,
  } = useCatalogStore()

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAll()
        .then(() => Promise.all([loadCategories(), loadCoupons(), loadBanners(), loadBlogs(), loadReviews(), loadInventory()]))
        .catch((e) => toast.error(`Failed to load admin data: ${e.message}`))
    }
  }, [user?.role, loadAll, loadCategories, loadCoupons, loadBanners, loadBlogs, loadReviews, loadInventory])

  const [tab, setTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null)
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null)
  const [creatingBanner, setCreatingBanner] = useState(false)
  const [editingBlog, setEditingBlog] = useState<AdminBlog | null>(null)
  const [creatingBlog, setCreatingBlog] = useState(false)
  const [editingReview, setEditingReview] = useState<AdminReview | null>(null)
  const [creatingReview, setCreatingReview] = useState(false)
  const [editingInventory, setEditingInventory] = useState<AdminInventory | null>(null)
  const [creatingInventory, setCreatingInventory] = useState(false)

  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.stock, 0)
    const inventoryValue = products.reduce((s, p) => s + (p.salePrice ?? p.price) * p.stock, 0)
    const lowStock = products.filter((p) => p.stock < 20).length
    const revenue = orders
      .filter((o) => o.status === 'Delivered')
      .reduce((s, o) => s + o.total, 0)
    return {
      productCount: products.length,
      categoryCount: categories.length,
      totalStock,
      inventoryValue,
      lowStock,
      orderCount: orders.length,
      userCount: users.length,
      revenue,
    }
  }, [products, categories, orders, users])

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="h-10 w-10 text-orange-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin access required</h2>
        <p className="text-gray-500 mb-4">Sign in with the admin account to view this panel.</p>
        <Button onClick={() => navigate('login')} className="bg-orange-400 hover:bg-orange-500">
          Sign in as admin
        </Button>
      </div>
    )
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3"><Shield className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm opacity-90">Welcome back, {user.name}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              resetCatalog()
                .then(() => toast.success('Data refreshed'))
                .catch((e) => toast.error(e.message))
            }}
            className="bg-white text-orange-500 hover:bg-orange-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Reset data
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {(['overview', 'products', 'categories', 'orders', 'users', 'messages', 'subscribers', 'banners', 'coupons', 'blog', 'reviews', 'inventory'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                tab === t
                  ? 'bg-orange-400 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Products" value={stats.productCount} />
            <StatCard icon={Boxes} label="Categories" value={stats.categoryCount} />
            <StatCard icon={ShoppingCart} label="Orders" value={stats.orderCount} />
            <StatCard icon={Users} label="Users" value={stats.userCount} />
            <StatCard
              icon={IndianRupee}
              label="Revenue (delivered)"
              value={`₹${stats.revenue.toLocaleString('en-IN')}`}
            />
            <StatCard
              icon={IndianRupee}
              label="Inventory value"
              value={`₹${stats.inventoryValue.toLocaleString('en-IN')}`}
            />
            <Card className="sm:col-span-2 lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Low stock alerts ({stats.lowStock})</h3>
                <ul className="space-y-2">
                  {products
                    .filter((p) => p.stock < 20)
                    .slice(0, 5)
                    .map((p) => (
                      <li key={p.id} className="flex items-center justify-between text-sm">
                        <span>{p.name}</span>
                        <Badge variant="outline" className="text-orange-500 border-orange-300">
                          {p.stock} left
                        </Badge>
                      </li>
                    ))}
                  {stats.lowStock === 0 && (
                    <li className="text-sm text-gray-500">All products are well stocked.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'products' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products or categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Button onClick={() => setCreating(true)} className="bg-orange-400 hover:bg-orange-500">
                  <Plus className="h-4 w-4 mr-1" /> Add product
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Product</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Price</th>
                      <th className="py-2 px-2">Stock</th>
                      <th className="py-2 px-2">Rating</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{p.name}</td>
                        <td className="py-2 px-2 text-gray-600">{p.category}</td>
                        <td className="py-2 px-2">
                          ₹{(p.salePrice ?? p.price).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-2">
                          <Badge
                            variant="outline"
                            className={
                              p.stock < 20
                                ? 'text-orange-500 border-orange-300'
                                : 'text-green-600 border-green-300'
                            }
                          >
                            {p.stock}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 inline-flex items-center gap-1">
                          <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                          {p.rating}
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              navigate('product', { id: p.id })
                            }}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditing(p)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"?`)) {
                                deleteProduct(p.id)
                                  .then(() => toast.success('Product deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'orders' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Orders ({orders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Order</th>
                      <th className="py-2 px-2">Customer</th>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Items</th>
                      <th className="py-2 px-2">Total</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium">{o.id}</td>
                        <td className="py-2 px-2">
                          <div>{o.customer}</div>
                          <div className="text-xs text-gray-500">{o.email}</div>
                        </td>
                        <td className="py-2 px-2 text-gray-600">{o.date}</td>
                        <td className="py-2 px-2">{o.items}</td>
                        <td className="py-2 px-2">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-2">
                          <Select
                            value={o.status}
                            onValueChange={(v) => {
                              updateOrderStatus(o.id, v as AdminOrder['status'])
                                .then(() => toast.success(`Order ${o.id} → ${v}`))
                                .catch((e) => toast.error(e.message))
                            }}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewingOrder(o)}
                            title="View bill"
                          >
                            <Receipt className="h-4 w-4 text-orange-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingOrder(o)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete order ${o.id}?`)) {
                                deleteOrder(o.id)
                                  .then(() => toast.success('Order deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'users' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-orange-400" />
                <h3 className="font-semibold">Users ({users.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Joined</th>
                    <th className="py-2 px-2">Role</th>
                    <th className="py-2 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 px-2 font-medium">{u.name}</td>
                      <td className="py-2 px-2">{u.email}</td>
                      <td className="py-2 px-2 text-gray-600">{u.joined}</td>
                      <td className="py-2 px-2">
                        <Select
                          value={u.role}
                          onValueChange={(v) => {
                            updateUserRole(u.id, v as AdminUser['role'])
                              .then(() => toast.success(`${u.name} → ${v}`))
                              .catch((e) => toast.error(e.message))
                          }}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="user">user</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2 text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingUser(u)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (u.email === 'admin@mealicious.com') {
                              toast.error('Cannot delete the root admin')
                              return
                            }
                            if (confirm(`Delete user ${u.name}?`)) {
                              deleteUser(u.id)
                                .then(() => toast.success('User deleted'))
                                .catch((e) => toast.error(e.message))
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {tab === 'categories' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Categories ({adminCategories.length})</h3>
                <Button onClick={() => setCreatingCategory(true)} className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Slug</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCategories.map((cat) => (
                      <tr key={cat.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{cat.name}</td>
                        <td className="py-2 px-2 text-gray-600">{cat.slug}</td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingCategory(cat)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete "${cat.name}"?`)) {
                                deleteCategory(cat.id)
                                  .then(() => toast.success('Category deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {adminCategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'messages' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Contact Messages</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Messages from contact form will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'subscribers' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Newsletter Subscribers</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email subscribers will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'banners' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Banners ({banners.length})</h3>
                <Button onClick={() => setCreatingBanner(true)} className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Banner
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Title</th>
                      <th className="py-2 px-2">Image</th>
                      <th className="py-2 px-2">Link</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{banner.title}</td>
                        <td className="py-2 px-2 text-gray-600 truncate max-w-xs">{banner.image}</td>
                        <td className="py-2 px-2 text-gray-600 truncate max-w-xs">{banner.link}</td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingBanner(banner)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete "${banner.title}"?`)) {
                                deleteBanner(banner.id)
                                  .then(() => toast.success('Banner deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {banners.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No banners yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'coupons' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Coupons & Discounts ({coupons.length})</h3>
                <Button onClick={() => setCreatingCoupon(true)} className="bg-orange-400 hover:bg-orange-500">
                  <Plus className="h-4 w-4 mr-1" /> Add Coupon
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Code</th>
                      <th className="py-2 px-2">Discount</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{coupon.code}</td>
                        <td className="py-2 px-2">{coupon.discount}%</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className={coupon.status === 'active' ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}>
                            {coupon.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingCoupon(coupon)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete coupon ${coupon.code}?`)) {
                                deleteCoupon(coupon.id)
                                  .then(() => toast.success('Coupon deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No coupons yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'blog' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Blog Posts ({blogs.length})</h3>
                <Button onClick={() => setCreatingBlog(true)} className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> New Post
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Title</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{blog.title}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className={blog.published ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}>
                            {blog.published ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingBlog(blog)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete "${blog.title}"?`)) {
                                deleteBlog(blog.id)
                                  .then(() => toast.success('Blog deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {blogs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500">
                          No blog posts yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'reviews' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Product Reviews ({reviews.length})</h3>
                <Button onClick={() => setCreatingReview(true)} className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Review
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Product</th>
                      <th className="py-2 px-2">Rating</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{review.productName}</td>
                        <td className="py-2 px-2 inline-flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-1">{review.rating}</span>
                        </td>
                        <td className="py-2 px-2">
                          <Badge
                            variant="outline"
                            className={
                              review.status === 'approved'
                                ? 'text-green-600 border-green-300'
                                : review.status === 'pending'
                                  ? 'text-yellow-600 border-yellow-300'
                                  : 'text-red-600 border-red-300'
                            }
                          >
                            {review.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingReview(review)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete review for "${review.productName}"?`)) {
                                deleteReview(review.id)
                                  .then(() => toast.success('Review deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No reviews yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'inventory' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Inventory ({inventory.length})</h3>
                <Button onClick={() => setCreatingInventory(true)} className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Product</th>
                      <th className="py-2 px-2">Stock</th>
                      <th className="py-2 px-2">Low Stock Alert</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-orange-50/40">
                        <td className="py-2 px-2 font-medium">{item.productName}</td>
                        <td className="py-2 px-2">
                          <Badge
                            variant="outline"
                            className={
                              item.stock < item.lowStockAlert
                                ? 'text-orange-500 border-orange-300'
                                : 'text-green-600 border-green-300'
                            }
                          >
                            {item.stock}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">{item.lowStockAlert}</td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingInventory(item)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete inventory for "${item.productName}"?`)) {
                                deleteInventory(item.id)
                                  .then(() => toast.success('Inventory item deleted'))
                                  .catch((e) => toast.error(e.message))
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No inventory items yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ProductDialog
        open={creating || editing !== null}
        product={editing}
        categories={categories.map((c) => c.name)}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={(data) => {
          if (editing) {
            updateProduct(editing.id, data)
              .then(() => toast.success('Product updated'))
              .catch((e) => toast.error(e.message))
          } else {
            const newP = {
              ...emptyProduct(),
              ...data,
              slug: (data.name ?? 'new-product').toLowerCase().replace(/\s+/g, '-'),
            }
            addProduct(newP)
              .then(() => toast.success('Product created'))
              .catch((e) => toast.error(e.message))
          }
          setCreating(false)
          setEditing(null)
        }}
      />

      <BillDialog order={viewingOrder} onClose={() => setViewingOrder(null)} />

      <OrderDialog
        open={editingOrder !== null}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSubmit={(data) => {
          if (editingOrder) {
            updateOrder(editingOrder.id, data)
              .then(() => toast.success('Order updated'))
              .catch((e) => toast.error(e.message))
          }
          setEditingOrder(null)
        }}
      />

      <UserDialog
        open={editingUser !== null}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={(data) => {
          if (editingUser) {
            updateUser(editingUser.id, data)
              .then(() => toast.success('User updated'))
              .catch((e) => toast.error(e.message))
          }
          setEditingUser(null)
        }}
      />

      <CategoryDialog
        open={creatingCategory || editingCategory !== null}
        category={editingCategory}
        onClose={() => {
          setCreatingCategory(false)
          setEditingCategory(null)
        }}
        onSubmit={(data) => {
          if (editingCategory) {
            updateCategory(editingCategory.id, data)
              .then(() => toast.success('Category updated'))
              .catch((e) => toast.error(e.message))
          } else {
            const newCat = {
              id: `cat-${Date.now()}`,
              name: data.name ?? '',
              slug: data.slug ?? '',
            }
            addCategory(newCat)
              .then(() => toast.success('Category created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingCategory(false)
          setEditingCategory(null)
        }}
      />

      <CouponDialog
        open={creatingCoupon || editingCoupon !== null}
        coupon={editingCoupon}
        onClose={() => {
          setCreatingCoupon(false)
          setEditingCoupon(null)
        }}
        onSubmit={(data) => {
          if (editingCoupon) {
            updateCoupon(editingCoupon.id, data)
              .then(() => toast.success('Coupon updated'))
              .catch((e) => toast.error(e.message))
          } else {
            addCoupon(data)
              .then(() => toast.success('Coupon created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingCoupon(false)
          setEditingCoupon(null)
        }}
      />

      <BannerDialog
        open={creatingBanner || editingBanner !== null}
        banner={editingBanner}
        onClose={() => {
          setCreatingBanner(false)
          setEditingBanner(null)
        }}
        onSubmit={(data) => {
          if (editingBanner) {
            updateBanner(editingBanner.id, data)
              .then(() => toast.success('Banner updated'))
              .catch((e) => toast.error(e.message))
          } else {
            addBanner(data)
              .then(() => toast.success('Banner created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingBanner(false)
          setEditingBanner(null)
        }}
      />

      <BlogDialog
        open={creatingBlog || editingBlog !== null}
        blog={editingBlog}
        onClose={() => {
          setCreatingBlog(false)
          setEditingBlog(null)
        }}
        onSubmit={(data) => {
          if (editingBlog) {
            updateBlog(editingBlog.id, data)
              .then(() => toast.success('Blog updated'))
              .catch((e) => toast.error(e.message))
          } else {
            addBlog(data)
              .then(() => toast.success('Blog created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingBlog(false)
          setEditingBlog(null)
        }}
      />

      <ReviewDialog
        open={creatingReview || editingReview !== null}
        review={editingReview}
        onClose={() => {
          setCreatingReview(false)
          setEditingReview(null)
        }}
        onSubmit={(data) => {
          if (editingReview) {
            updateReview(editingReview.id, data)
              .then(() => toast.success('Review updated'))
              .catch((e) => toast.error(e.message))
          } else {
            addReview(data)
              .then(() => toast.success('Review created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingReview(false)
          setEditingReview(null)
        }}
      />

      <InventoryDialog
        open={creatingInventory || editingInventory !== null}
        inventory={editingInventory}
        onClose={() => {
          setCreatingInventory(false)
          setEditingInventory(null)
        }}
        onSubmit={(data) => {
          if (editingInventory) {
            updateInventory(editingInventory.id, data)
              .then(() => toast.success('Inventory updated'))
              .catch((e) => toast.error(e.message))
          } else {
            addInventory(data)
              .then(() => toast.success('Inventory created'))
              .catch((e) => toast.error(e.message))
          }
          setCreatingInventory(false)
          setEditingInventory(null)
        }}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-3"><Icon className="h-5 w-5 text-orange-500" /></div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BillCard({ order, onOpen }: { order: AdminOrder; onOpen: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition" onClick={onOpen}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold">{order.id}</p>
          <Badge variant="outline" className="text-orange-500 border-orange-300">
            {order.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{order.customer}</p>
        <p className="text-xs text-gray-500">{order.date}</p>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{order.items} items</span>
          <span className="font-bold text-orange-500">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function BillDialog({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  return (
    <Dialog open={order !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-orange-500" /> Bill — {order?.id}
          </DialogTitle>
          <DialogDescription>Order receipt details</DialogDescription>
        </DialogHeader>
        {order && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{order.customer}</p>
                <p className="text-xs text-gray-500">{order.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{order.date}</p>
                <Badge variant="outline" className="mt-1 text-orange-500 border-orange-300">
                  {order.status}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Items</span>
              <span>{order.items}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(order.total - 49).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹49</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-orange-500">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} className="bg-orange-400 hover:bg-orange-500">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductDialog({
  open,
  product,
  categories,
  onClose,
  onSubmit,
}: {
  open: boolean
  product: Product | null
  categories: string[]
  onClose: () => void
  onSubmit: (data: Partial<Product>) => void
}) {
  const [form, setForm] = useState<Partial<Product>>(() => product ?? emptyProduct())
  const [prevId, setPrevId] = useState(product?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (product?.id !== prevId || open !== prevOpen) {
    setPrevId(product?.id)
    setPrevOpen(open)
    setForm(product ?? emptyProduct())
  }

  const handle = (key: keyof Product, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'New product'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.category || !form.name) {
              alert('Name and Category are required')
              return
            }
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={form.name ?? ''}
              onChange={(e) => handle('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Short description</Label>
            <Input
              value={form.shortDesc ?? ''}
              onChange={(e) => handle('shortDesc', e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => handle('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Price (₹)</Label>
              <Input
                type="number"
                value={form.price ?? 0}
                onChange={(e) => handle('price', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Sale price (₹)</Label>
              <Input
                type="number"
                value={form.salePrice ?? ''}
                onChange={(e) =>
                  handle('salePrice', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Stock</Label>
              <Input
                type="number"
                value={form.stock ?? 0}
                onChange={(e) => handle('stock', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">SKU</Label>
              <Input value={form.sku ?? ''} onChange={(e) => handle('sku', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Category *</Label>
              <Select
                value={form.category ?? ''}
                onValueChange={(v) => {
                  handle('category', v)
                  handle('categorySlug', v.toLowerCase().replace(/\s+/g, '-'))
                }}
              >
                <SelectTrigger className={!form.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.category && <p className="text-red-500 text-xs mt-1">Category is required</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Rating</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating ?? 0}
                onChange={(e) => handle('rating', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Image URL</Label>
            <Input
              value={form.images?.[0] ?? ''}
              onChange={(e) => handle('images', [e.target.value])}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => handle('featured', e.target.checked)}
              />{' '}
              Featured
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!form.bestSeller}
                onChange={(e) => handle('bestSeller', e.target.checked)}
              />{' '}
              Best seller
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!form.isNew}
                onChange={(e) => handle('isNew', e.target.checked)}
              />{' '}
              New
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {product ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OrderDialog({
  open,
  order,
  onClose,
  onSubmit,
}: {
  open: boolean
  order: AdminOrder | null
  onClose: () => void
  onSubmit: (data: Partial<AdminOrder>) => void
}) {
  const [form, setForm] = useState<Partial<AdminOrder>>(() => order ?? {})
  const [prevId, setPrevId] = useState(order?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (order?.id !== prevId || open !== prevOpen) {
    setPrevId(order?.id)
    setPrevOpen(open)
    setForm(order ?? {})
  }

  const handle = (key: keyof AdminOrder, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>Update order details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Order Number</Label>
            <Input value={form.id ?? ''} disabled />
          </div>
          <div>
            <Label className="mb-1.5 block">Customer Name</Label>
            <Input
              value={form.customer ?? ''}
              onChange={(e) => handle('customer', e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Customer Email</Label>
            <Input
              value={form.email ?? ''}
              onChange={(e) => handle('email', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Items</Label>
              <Input
                type="number"
                value={form.items ?? 0}
                onChange={(e) => handle('items', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Total (₹)</Label>
              <Input
                type="number"
                value={form.total ?? 0}
                onChange={(e) => handle('total', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select
              value={form.status ?? 'Pending'}
              onValueChange={(v) => handle('status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserDialog({
  open,
  user,
  onClose,
  onSubmit,
}: {
  open: boolean
  user: AdminUser | null
  onClose: () => void
  onSubmit: (data: Partial<AdminUser>) => void
}) {
  const [form, setForm] = useState<Partial<AdminUser>>(() => user ?? {})
  const [prevId, setPrevId] = useState(user?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (user?.id !== prevId || open !== prevOpen) {
    setPrevId(user?.id)
    setPrevOpen(open)
    setForm(user ?? {})
  }

  const handle = (key: keyof AdminUser, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={form.name ?? ''}
              onChange={(e) => handle('name', e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Email</Label>
            <Input
              value={form.email ?? ''}
              onChange={(e) => handle('email', e.target.value)}
              disabled
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Phone</Label>
            <Input
              value={form.phone ?? ''}
              onChange={(e) => handle('phone', e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Role</Label>
            <Select
              value={form.role ?? 'user'}
              onValueChange={(v) => handle('role', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Joined</Label>
            <Input value={form.joined ?? ''} disabled />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CategoryDialog({
  open,
  category,
  onClose,
  onSubmit,
}: {
  open: boolean
  category: AdminCategory | null
  onClose: () => void
  onSubmit: (data: Partial<AdminCategory>) => void
}) {
  const [form, setForm] = useState<Partial<AdminCategory>>(() => category ?? { name: '', slug: '' })
  const [prevId, setPrevId] = useState(category?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (category?.id !== prevId || open !== prevOpen) {
    setPrevId(category?.id)
    setPrevOpen(open)
    setForm(category ?? { name: '', slug: '' })
  }

  const handle = (key: keyof AdminCategory, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleNameChange = (name: string) => {
    handle('name', name)
    // Auto-generate slug from name
    handle('slug', name.toLowerCase().replace(/\s+/g, '-'))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={form.name ?? ''}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Slug</Label>
            <Input
              value={form.slug ?? ''}
              onChange={(e) => handle('slug', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {category ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CouponDialog({
  open,
  coupon,
  onClose,
  onSubmit,
}: {
  open: boolean
  coupon: AdminCoupon | null
  onClose: () => void
  onSubmit: (data: Partial<AdminCoupon>) => void
}) {
  const [form, setForm] = useState<Partial<AdminCoupon>>(() => coupon ?? { code: '', discount: 0, status: 'active' })
  const [prevId, setPrevId] = useState(coupon?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (coupon?.id !== prevId || open !== prevOpen) {
    setPrevId(coupon?.id)
    setPrevOpen(open)
    setForm(coupon ?? { code: '', discount: 0, status: 'active' })
  }

  const handle = (key: keyof AdminCoupon, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit coupon' : 'New coupon'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Code</Label>
            <Input
              value={form.code ?? ''}
              onChange={(e) => handle('code', e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Discount (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.discount ?? 0}
              onChange={(e) => handle('discount', Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select
              value={form.status ?? 'active'}
              onValueChange={(v) => handle('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {coupon ? 'Save changes' : 'Create coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BannerDialog({
  open,
  banner,
  onClose,
  onSubmit,
}: {
  open: boolean
  banner: AdminBanner | null
  onClose: () => void
  onSubmit: (data: Partial<AdminBanner>) => void
}) {
  const [form, setForm] = useState<Partial<AdminBanner>>(() => banner ?? { title: '', image: '', link: '' })
  const [prevId, setPrevId] = useState(banner?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (banner?.id !== prevId || open !== prevOpen) {
    setPrevId(banner?.id)
    setPrevOpen(open)
    setForm(banner ?? { title: '', image: '', link: '' })
  }

  const handle = (key: keyof AdminBanner, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit banner' : 'New banner'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input
              value={form.title ?? ''}
              onChange={(e) => handle('title', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Image URL</Label>
            <Input
              type="url"
              value={form.image ?? ''}
              onChange={(e) => handle('image', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Link</Label>
            <Input
              type="url"
              value={form.link ?? ''}
              onChange={(e) => handle('link', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {banner ? 'Save changes' : 'Create banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BlogDialog({
  open,
  blog,
  onClose,
  onSubmit,
}: {
  open: boolean
  blog: AdminBlog | null
  onClose: () => void
  onSubmit: (data: Partial<AdminBlog>) => void
}) {
  const [form, setForm] = useState<Partial<AdminBlog>>(() => blog ?? { title: '', excerpt: '', published: false })
  const [prevId, setPrevId] = useState(blog?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (blog?.id !== prevId || open !== prevOpen) {
    setPrevId(blog?.id)
    setPrevOpen(open)
    setForm(blog ?? { title: '', excerpt: '', published: false })
  }

  const handle = (key: keyof AdminBlog, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{blog ? 'Edit blog post' : 'New blog post'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input
              value={form.title ?? ''}
              onChange={(e) => handle('title', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Excerpt</Label>
            <Textarea
              rows={3}
              value={form.excerpt ?? ''}
              onChange={(e) => handle('excerpt', e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={!!form.published}
              onChange={(e) => handle('published', e.target.checked)}
            />
            <Label htmlFor="published" className="mb-0 cursor-pointer">
              {form.published ? 'Published' : 'Draft'}
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {blog ? 'Save changes' : 'Create blog post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ReviewDialog({
  open,
  review,
  onClose,
  onSubmit,
}: {
  open: boolean
  review: AdminReview | null
  onClose: () => void
  onSubmit: (data: Partial<AdminReview>) => void
}) {
  const [form, setForm] = useState<Partial<AdminReview>>(() => review ?? { productName: '', rating: 1, status: 'pending' })
  const [prevId, setPrevId] = useState(review?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (review?.id !== prevId || open !== prevOpen) {
    setPrevId(review?.id)
    setPrevOpen(open)
    setForm(review ?? { productName: '', rating: 1, status: 'pending' })
  }

  const handle = (key: keyof AdminReview, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit review' : 'New review'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const rating = form.rating ?? 1
            if (rating < 1 || rating > 5) {
              alert('Rating must be between 1 and 5')
              return
            }
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Product Name</Label>
            <Input
              value={form.productName ?? ''}
              onChange={(e) => handle('productName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Rating</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={form.rating ?? 1}
              onChange={(e) => handle('rating', Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select
              value={form.status ?? 'pending'}
              onValueChange={(v) => handle('status', v as 'approved' | 'pending' | 'rejected')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {review ? 'Save changes' : 'Create review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function InventoryDialog({
  open,
  inventory,
  onClose,
  onSubmit,
}: {
  open: boolean
  inventory: AdminInventory | null
  onClose: () => void
  onSubmit: (data: Partial<AdminInventory>) => void
}) {
  const [form, setForm] = useState<Partial<AdminInventory>>(() => inventory ?? { productName: '', stock: 0, lowStockAlert: 10 })
  const [prevId, setPrevId] = useState(inventory?.id)
  const [prevOpen, setPrevOpen] = useState(open)

  if (inventory?.id !== prevId || open !== prevOpen) {
    setPrevId(inventory?.id)
    setPrevOpen(open)
    setForm(inventory ?? { productName: '', stock: 0, lowStockAlert: 10 })
  }

  const handle = (key: keyof AdminInventory, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inventory ? 'Edit inventory' : 'New inventory'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Product Name</Label>
            <Input
              value={form.productName ?? ''}
              onChange={(e) => handle('productName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Stock</Label>
            <Input
              type="number"
              min="0"
              value={form.stock ?? 0}
              onChange={(e) => handle('stock', Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Low Stock Alert</Label>
            <Input
              type="number"
              min="0"
              value={form.lowStockAlert ?? 10}
              onChange={(e) => handle('lowStockAlert', Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {inventory ? 'Save changes' : 'Create inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function emptyProduct(): Product {
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: 0,
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600'],
    category: '',
    categorySlug: '',
    variants: [],
    tags: [],
    nutrition: { calories: '', protein: '', fat: '', carbs: '', fiber: '' },
    stock: 0,
    sku: '',
    featured: false,
    bestSeller: false,
    isNew: true,
    rating: 4.5,
    reviewCount: 0,
  }
}
