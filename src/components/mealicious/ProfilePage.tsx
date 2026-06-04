'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  User as UserIcon, Mail, Phone, Heart, Package, LogOut,
  Shield, ShoppingBag, MapPin, Plus, Pencil, Trash2, Star, Gift, Copy,
} from 'lucide-react'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
  'Jammu and Kashmir','Ladakh','Goa',
]

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

const EMPTY_ADDR: Omit<Address, 'id' | 'isDefault'> = {
  label: 'Home', fullName: '', phone: '', address1: '', address2: '', city: '', state: '', pincode: '',
}

export default function ProfilePage() {
  const { user, updateProfile, logout, navigate, wishlistItems, cartItems, addresses, saveAddress, deleteAddress, setDefaultAddress } = useAppStore()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  // Address dialog
  const [addrOpen, setAddrOpen] = useState(false)
  const [editingAddr, setEditingAddr] = useState<Address | null>(null)
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR)

  // Referral
  const [referral, setReferral] = useState<{ code: string; shareUrl: string; credits: number; totalReferrals: number; completedReferrals: number } | null>(null)
  useEffect(() => {
    if (!user?.email) return
    fetch(`/api/referral?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.code) setReferral(d) })
      .catch(() => {})
  }, [user?.email])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">You need to be signed in</h2>
        <Button onClick={() => navigate('login')} className="bg-orange-400 hover:bg-orange-500">Sign In</Button>
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, email, phone })
    toast.success('Profile updated')
  }

  function openNewAddr() {
    setEditingAddr(null)
    setAddrForm(EMPTY_ADDR)
    setAddrOpen(true)
  }

  function openEditAddr(addr: Address) {
    setEditingAddr(addr)
    setAddrForm({ label: addr.label, fullName: addr.fullName, phone: addr.phone, address1: addr.address1, address2: addr.address2, city: addr.city, state: addr.state, pincode: addr.pincode })
    setAddrOpen(true)
  }

  function handleSaveAddr() {
    if (!addrForm.fullName || !addrForm.address1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      toast.error('Fill all required fields')
      return
    }
    if (!/^\d{6}$/.test(addrForm.pincode)) { toast.error('Invalid pincode'); return }
    saveAddress({ ...addrForm, id: editingAddr?.id ?? `addr-${Date.now()}`, isDefault: editingAddr?.isDefault ?? (addresses?.length === 0) })
    toast.success(editingAddr ? 'Address updated' : 'Address saved')
    setAddrOpen(false)
  }

  const initial = (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()
  const savedAddresses: Address[] = addresses ?? []

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
            <p className="text-sm opacity-90 flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white text-orange-500 text-xs font-semibold">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('wishlist')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><Heart className="h-5 w-5 text-orange-400" /></div>
              <div><p className="text-2xl font-bold">{wishlistItems.length}</p><p className="text-sm text-gray-500">Wishlist items</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('cart')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><ShoppingBag className="h-5 w-5 text-orange-400" /></div>
              <div><p className="text-2xl font-bold">{cartItems.length}</p><p className="text-sm text-gray-500">Items in cart</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('track-order')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3"><Package className="h-5 w-5 text-orange-400" /></div>
              <div><p className="font-semibold">Track Orders</p><p className="text-sm text-gray-500">See order status</p></div>
            </CardContent>
          </Card>
          {user.role === 'admin' && (
            <Card className="cursor-pointer hover:shadow-md border-orange-200" onClick={async () => { window.location.href = '/admin/dashboard' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-3"><Shield className="h-5 w-5 text-orange-500" /></div>
                <div><p className="font-semibold text-orange-500">Admin Panel</p><p className="text-sm text-gray-500">Manage store</p></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile form */}
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
                  <Input id="p-name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="p-email" className="mb-1.5 inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                  <Input id="p-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="p-phone" className="mb-1.5 inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                  <Input id="p-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-9876543210" />
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

          {/* Saved Addresses */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-400" /> Saved Addresses</h2>
                  <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                </div>
                <Button size="sm" onClick={openNewAddr} className="bg-orange-400 hover:bg-orange-500">
                  <Plus className="h-4 w-4 mr-1" /> Add Address
                </Button>
              </div>
              <Separator className="mb-4" />

              {savedAddresses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No saved addresses yet</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={openNewAddr}>Add your first address</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className={`border rounded-lg p-4 ${addr.isDefault ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">{addr.label}</Badge>
                            {addr.isDefault && <Badge className="bg-orange-400 text-white text-xs"><Star className="h-3 w-3 mr-0.5" />Default</Badge>}
                          </div>
                          <p className="font-medium text-sm">{addr.fullName}</p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}
                          </p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                        <div className="flex gap-1 ml-2 shrink-0">
                          {!addr.isDefault && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-orange-500" onClick={() => { setDefaultAddress(addr.id); toast.success('Default address updated') }}>
                              Set default
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditAddr(addr)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => { deleteAddress(addr.id); toast.success('Address removed') }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Card */}
          {referral && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-5 w-5 text-orange-400" />
                  <h2 className="text-xl font-bold">Refer & Earn</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Share your code. Friend gets a deal, you earn ₹50 credit per successful referral.</p>
                <Separator className="mb-4" />
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-orange-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-500">₹{referral.credits}</p>
                    <p className="text-xs text-gray-500">Credits earned</p>
                  </div>
                  <div className="text-center bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-500">{referral.completedReferrals}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center bg-neutral-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-neutral-700">{referral.totalReferrals}</p>
                    <p className="text-xs text-gray-500">Total invites</p>
                  </div>
                </div>
                <Label className="text-xs mb-1 block">Your Referral Code</Label>
                <div className="flex gap-2">
                  <Input readOnly value={referral.code} className="font-mono font-bold text-orange-600" />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(referral.code); toast.success('Code copied!') }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input readOnly value={referral.shareUrl} className="text-xs text-gray-500" />
                  <Button className="bg-orange-400 hover:bg-orange-500 shrink-0" onClick={() => { navigator.clipboard.writeText(referral.shareUrl); toast.success('Share link copied!') }}>
                    <Copy className="h-4 w-4 mr-1" />Share Link
                  </Button>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Get premium dry fruits at Mealicious! Use my code ${referral.code} 🥜 ${referral.shareUrl}`)}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#25D366] font-medium hover:underline"
                >
                  <Gift className="h-4 w-4" />Share on WhatsApp
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={addrOpen} onOpenChange={v => !v && setAddrOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingAddr ? 'Edit Address' : 'Add New Address'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-xs mb-1 block">Label</Label>
              <Select value={addrForm.label} onValueChange={v => setAddrForm(p => ({ ...p, label: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Home', 'Work', 'Other'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Full Name *</Label><Input className="h-9" value={addrForm.fullName} onChange={e => setAddrForm(p => ({ ...p, fullName: e.target.value }))} /></div>
              <div><Label className="text-xs mb-1 block">Phone *</Label><Input className="h-9" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs mb-1 block">Address Line 1 *</Label><Input className="h-9" value={addrForm.address1} onChange={e => setAddrForm(p => ({ ...p, address1: e.target.value }))} placeholder="House no, street name" /></div>
            <div><Label className="text-xs mb-1 block">Address Line 2</Label><Input className="h-9" value={addrForm.address2} onChange={e => setAddrForm(p => ({ ...p, address2: e.target.value }))} placeholder="Landmark, area (optional)" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">City *</Label><Input className="h-9" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div><Label className="text-xs mb-1 block">Pincode *</Label><Input className="h-9" value={addrForm.pincode} onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))} maxLength={6} /></div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">State *</Label>
              <Select value={addrForm.state} onValueChange={v => setAddrForm(p => ({ ...p, state: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddrOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAddr} className="bg-orange-400 hover:bg-orange-500">Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
