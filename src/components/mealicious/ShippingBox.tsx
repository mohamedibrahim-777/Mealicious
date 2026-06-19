'use client'

import { useState } from 'react'
import { Truck, MapPin, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShippingRate {
  courierId?: number
  courierName?: string
  rate: number
  estimatedDays: number
  etd?: string
  cod?: boolean
}

interface ShippingBoxProps {
  productPrice: number
  productWeight?: number
  declaredValue?: number
}

export function ShippingBox({ productPrice, productWeight = 0.5, declaredValue = productPrice }: ShippingBoxProps) {
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [fallbackRate, setFallbackRate] = useState<{ rate: number; label: string } | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Enter valid 6-digit pincode')
      return
    }

    setLoading(true)
    setError('')
    setRates([])
    setFallbackRate(null)

    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode,
          weight: productWeight,
          declaredValue,
          cod: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to calculate shipping')
        toast.error(data.error || 'Shipping calculation failed')
        return
      }

      if (data.rates && data.rates.length > 0) {
        setRates(data.rates)
        toast.success('Shipping rates calculated')
      } else if (data.fallback) {
        setFallbackRate(data.fallback)
        toast.success('Using standard shipping rate')
      } else {
        setError('No shipping options available for this area')
      }
    } catch (e) {
      setError('Network error - using standard rate')
      // Use demo fallback
      const shippingCost = productPrice >= 599 ? 0 : 49
      setFallbackRate({ rate: shippingCost, label: 'Standard Delivery' })
    } finally {
      setLoading(false)
    }
  }

  const bestRate = rates.length > 0 ? rates[0] : fallbackRate

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Shipping Details</h3>
      </div>

      <div className="space-y-3">
        {/* Pincode Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter delivery pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleCalculate}
            disabled={loading || pincode.length !== 6}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Calculating...' : 'Check'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Shipping Rates */}
        {rates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Available Options:</h4>
            {rates.map((rate, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{rate.courierName}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {rate.estimatedDays} days
                    </span>
                    {rate.cod && <span className="text-green-600">COD Available</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">₹{rate.rate}</p>
                  {idx === 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Best</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback Rate */}
        {fallbackRate && rates.length === 0 && (
          <div className="bg-white border border-gray-200 rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{fallbackRate.label}</p>
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  3-5 days
                </span>
                <span className="text-green-600">COD Available</span>
              </div>
            </div>
            <p className="font-bold text-lg text-gray-900">
              {fallbackRate.rate === 0 ? 'FREE' : `₹${fallbackRate.rate}`}
            </p>
          </div>
        )}

        {/* Pickup Location Info */}
        <div className="bg-white border border-gray-200 rounded p-3 text-sm">
          <p className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-4 w-4 text-orange-400" />
            Ships from Chennai, India
          </p>
        </div>
      </div>
    </div>
  )
}
