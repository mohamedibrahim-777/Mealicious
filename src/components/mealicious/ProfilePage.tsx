'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  User as UserIcon,
  Mail,
  Phone,
  Heart,
  Package,
  LogOut,
  Shield,
  ShoppingBag,
  MapPin,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile, logout, navigate, wishlistItems, cartItems } = useAppStore()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">You need to be signed in</h2>
        <Button onClick={() => navigate('login')} className="bg-orange-400 hover:bg-orange-500">
          Sign In
        </Button>
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, email, phone })
    toast.success('Profile updated')
  }

  const initial = (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-10 flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-white text-orange-500 flex items-center justify-center text-3xl font-bold shadow-lg">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
            <p className="text-sm opacity-90 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user.email}
            </p>
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white text-orange-500 text-xs font-semibold">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Sidebar stats */}
        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('wishlist')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><Heart className="h-5 w-5 text-orange-400" /></div>
              <div>
                <p className="text-2xl font-bold">{wishlistItems.length}</p>
                <p className="text-sm text-gray-500">Wishlist items</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('cart')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><ShoppingBag className="h-5 w-5 text-orange-400" /></div>
              <div>
                <p className="text-2xl font-bold">{cartItems.length}</p>
                <p className="text-sm text-gray-500">Items in cart</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('track-order')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><Package className="h-5 w-5 text-orange-400" /></div>
              <div>
                <p className="font-semibold">Track Orders</p>
                <p className="text-sm text-gray-500">See order status</p>
              </div>
            </CardContent>
          </Card>
          {user.role === 'admin' && (
            <Card className="cursor-pointer hover:shadow-md border-orange-200" onClick={() => navigate('admin')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-3"><Shield className="h-5 w-5 text-orange-500" /></div>
                <div>
                  <p className="font-semibold text-orange-500">Admin Panel</p>
                  <p className="text-sm text-gray-500">Manage the store</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile form */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Account Details</h2>
                <p className="text-sm text-gray-500">Update your personal information.</p>
              </div>
              <Separator />
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="p-name" className="mb-1.5 inline-flex items-center gap-2"><UserIcon className="h-4 w-4" /> Full name</Label>
                  <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="p-email" className="mb-1.5 inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                  <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="p-phone" className="mb-1.5 inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                  <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-9876543210" />
                </div>
                <div>
                  <Label className="mb-1.5 inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Default address</Label>
                  <Input placeholder="Add a default shipping address" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-orange-400 hover:bg-orange-500">Save changes</Button>
                  <Button type="button" variant="outline" onClick={() => { logout(); toast.success('Signed out') }}>
                    <LogOut className="h-4 w-4 mr-1" /> Sign out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
