'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useCatalogStore, type AdminOrder, type AdminUser } from '@/lib/catalog-store'
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
    orders,
    users,
    addProduct,
    updateProduct,
    deleteProduct,
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
      loadAll().catch((e) => toast.error(`Failed to load admin data: ${e.message}`))
    }
  }, [user?.role, loadAll])

  const [tab, setTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null)
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

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
                <h3 className="font-semibold">Categories ({categories.length})</h3>
                <Button className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <Card key={cat.id} className="p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.slug}</p>
                      </div>
                      <div className="space-x-1">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4 text-blue-500" /></Button>
                        <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
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
                <h3 className="font-semibold">Banners</h3>
                <Button className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Banner
                </Button>
              </div>
              <div className="grid gap-3">
                <p className="text-sm text-gray-500">Promotional banners will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'coupons' && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Coupons & Discounts</h3>
                <Button className="bg-orange-400 hover:bg-orange-500" size="sm">
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
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">No coupons yet</td>
                    </tr>
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
                <h3 className="font-semibold">Blog Posts</h3>
                <Button className="bg-orange-400 hover:bg-orange-500" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> New Post
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Blog posts will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'reviews' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Product Reviews</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Customer reviews and ratings will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'inventory' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Inventory Management</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Stock levels and inventory data will appear here</p>
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
  const [form, setForm] = useState<Partial<Product>>(product ?? emptyProduct())

  // Reset form whenever the dialog target changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(product ?? emptyProduct()) }, [product?.id, open])

  const handle = (key: keyof Product, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'New product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product details.' : 'Add a new product to the catalog.'}
          </DialogDescription>
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
              <Label className="mb-1.5 block">Category</Label>
              <Select
                value={form.category ?? ''}
                onValueChange={(v) => {
                  handle('category', v)
                  handle('categorySlug', v.toLowerCase().replace(/\s+/g, '-'))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
  const [form, setForm] = useState<Partial<AdminOrder>>(order ?? {})

  useEffect(() => {
    setForm(order ?? {})
  }, [order?.id, open])

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
  const [form, setForm] = useState<Partial<AdminUser>>(user ?? {})

  useEffect(() => {
    setForm(user ?? {})
  }, [user?.id, open])

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
