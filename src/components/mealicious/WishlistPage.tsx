'use client'

import { Heart, ShoppingBag, ArrowRight, ChevronRight, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { useCatalogStore } from '@/lib/catalog-store'
import ProductCard from '@/components/mealicious/ProductCard'

export default function WishlistPage() {
  const wishlistItems = useAppStore((s) => s.wishlistItems)
  const navigate = useAppStore((s) => s.navigate)
  const products = useCatalogStore((s) => s.products)

  const wishlistedProducts = products.filter((p) => wishlistItems.includes(p.id))

  const isEmpty = wishlistedProducts.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white">
      {/* Breadcrumb */}
      <div className="border-b bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-muted-foreground" aria-label="Breadcrumb">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-1 hover:text-orange-400 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-muted-foreground/50" />
            <span className="font-medium text-orange-400">Wishlist</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-400 to-orange-400" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 left-10 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute bottom-4 right-16 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-2 right-1/3 h-16 w-16 rounded-full bg-white/25 blur-xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Heart className="h-7 w-7 text-white fill-white/30" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
                  My Wishlist
                </h1>
                <p className="mt-1 text-blue-100 text-sm sm:text-base">
                  Your curated collection of favorites
                </p>
              </div>
            </div>
            {!isEmpty && (
              <Badge
                variant="secondary"
                className="bg-white/15 backdrop-blur-sm text-white border border-white/20 px-4 py-1.5 text-sm font-medium hover:bg-white/20"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isEmpty ? (
          /* Empty State */
          <Card className="border-dashed border-2 border-blue-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24 px-6 text-center">
              <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-100">
                  <Heart className="h-10 w-10 text-blue-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 border-2 border-white">
                  <span className="text-sm">0</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base leading-relaxed">
                Looks like you haven&apos;t added any products to your wishlist yet. Explore our
                premium collection of healthy snacks &amp; dry fruits and save your favorites!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('shop')}
                  className="bg-orange-400 hover:bg-orange-400 text-white px-6 h-11 text-sm font-medium"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Explore Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('home')}
                  className="border-blue-200 text-orange-400 hover:bg-blue-50 px-6 h-11 text-sm font-medium"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Wishlist Grid */
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{wishlistedProducts.length}</span>{' '}
                {wishlistedProducts.length === 1 ? 'product' : 'products'} in your wishlist
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('shop')}
                className="text-orange-400 hover:text-orange-400 hover:bg-blue-50"
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" />
                Continue Shopping
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => navigate('shop')}
                variant="outline"
                className="border-blue-200 text-orange-400 hover:bg-blue-50 px-8 h-11 text-sm font-medium"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Discover More Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
