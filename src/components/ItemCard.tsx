'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Item, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DollarSign, ImageIcon, Star } from 'lucide-react'

interface ItemCardProps {
  item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth()
  const [offerCount, setOfferCount] = useState(0)
  const isOwner = user?.id === item.user_id

  useEffect(() => {
    fetchOfferCount()

    // Subscribe to real-time offer changes for this item
    const subscription = supabase
      .channel(`offers:item_id=eq.${item.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `item_id=eq.${item.id}`
        },
        () => {
          // Refetch offer count when offers change
          fetchOfferCount()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [item.id])

  const fetchOfferCount = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('id')
        .eq('item_id', item.id)

      if (error) {
        console.error('Error fetching offer count:', error)
        return
      }

      setOfferCount(data?.length || 0)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Link href={`/items/${item.id}`} className="block">
      <div className="item-card">
        {/* Image Container */}
        <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              style={{ 
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={(e) => {
                console.error('Image failed to load:', item.image_url);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <ImageIcon className="h-12 w-12 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}
          
          {/* Owner Badge */}
          {isOwner && (
            <div className="absolute top-3 right-3">
              <div className="bg-blue-500 p-1 rounded-full shadow-md">
                <Star className="h-4 w-4 text-white" style={{ fill: 'currentColor' }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className="font-semibold text-gray-900 mb-1 text-lg">
            {item.title}
          </h3>
          
          <div className="separator"></div>
          
          <p className="condition-category" style={{ fontSize: '14px', color: '#666' }}>
            {item.description}
          </p>
          
          {/* Price */}
          <div className="price-offer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
            <div className="flex items-center text-gray-900 font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              <span>{item.price.toFixed(2)}</span>
            </div>
            
            <div className="text-xs text-gray-500">
              Total Offers: {offerCount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
