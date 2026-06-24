import { db } from '@/lib/db'
import { TopNav } from '@/components/admin/TopNav'
import { IndianRupee, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnalyticsStats() {
  try {
    const [paidOrders, totalOrders, productsCount, usersCount, products] = await Promise.all([
      db.order.findMany({
        where: { paymentStatus: 'paid' },
        select: { total: true }
      }),
      db.order.count(),
      db.product.count(),
      db.user.count(),
      db.product.findMany({
        select: { stock: true, lowStock: true }
      })
    ])

    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
    const lowStockCount = products.filter(p => p.stock < p.lowStock).length

    return {
      revenue,
      orderCount: totalOrders,
      productCount: productsCount,
      userCount: usersCount,
      lowStockCount
    }
  } catch (err) {
    console.error('Error fetching analytics stats:', err)
    return {
      revenue: 0,
      orderCount: 0,
      productCount: 0,
      userCount: 0,
      lowStockCount: 0
    }
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getAnalyticsStats()

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Analytics banner at the top */}
      <div className="w-full bg-stone-950 text-stone-100 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                MEALICIOUS OPERATIONS
              </h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Real-time store console & metrics</p>
            </div>
            
            {stats.lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold animate-pulse self-start md:self-auto">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} low in stock</span>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="relative overflow-hidden rounded-xl bg-stone-900/60 border border-stone-800 p-4 transition-all duration-300 hover:border-amber-500/30 group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <IndianRupee className="h-10 w-10 text-amber-400" />
              </div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-lg md:text-xl font-black text-stone-100 mt-1">
                ₹{stats.revenue.toLocaleString('en-IN')}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Total Orders */}
            <div className="relative overflow-hidden rounded-xl bg-stone-900/60 border border-stone-800 p-4 transition-all duration-300 hover:border-blue-500/30 group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingCart className="h-10 w-10 text-blue-400" />
              </div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-lg md:text-xl font-black text-stone-100 mt-1">
                {stats.orderCount.toLocaleString('en-IN')}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Active Products */}
            <div className="relative overflow-hidden rounded-xl bg-stone-900/60 border border-stone-800 p-4 transition-all duration-300 hover:border-emerald-500/30 group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="h-10 w-10 text-emerald-400" />
              </div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Active Products</p>
              <p className="text-lg md:text-xl font-black text-stone-100 mt-1">
                {stats.productCount.toLocaleString('en-IN')}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Customers */}
            <div className="relative overflow-hidden rounded-xl bg-stone-900/60 border border-stone-800 p-4 transition-all duration-300 hover:border-purple-500/30 group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="h-10 w-10 text-purple-400" />
              </div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Customers</p>
              <p className="text-lg md:text-xl font-black text-stone-100 mt-1">
                {stats.userCount.toLocaleString('en-IN')}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-fuchsia-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Navigation under Analytics */}
      <TopNav />

      {/* Subpage child content */}
      <main className="flex-1 overflow-auto bg-stone-50/50">
        {children}
      </main>
    </div>
  )
}

