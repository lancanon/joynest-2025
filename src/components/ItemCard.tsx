'use client'

import Image from 'next/image'
import { Item, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DollarSign, ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ItemCardProps {
  item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth()
  const [offersCount, setOffersCount] = useState(0)

  useEffect(() => {
    // Reset offers count when user changes
    setOffersCount(0)
    fetchOffersCount()
  }, [item.id, user?.id]) // Add user?.id to refresh when user changes

  const fetchOffersCount = async () => {
    try {
      // Direct query to offers table
      const { count, error } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', item.id)

      if (error) {
        console.error('Error fetching offers count:', error)
        setOffersCount(0)
        return
      }

      setOffersCount(count || 0)
    } catch (error) {
      console.error('Error:', error)
      setOffersCount(0)
    }
  }

  return (
    <div 
      onClick={() => window.location.href = `/items/${item.id}`}
      className="item-card cursor-pointer"
      style={{
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        width: '300px',
        minHeight: '360px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Image Container */}
      <div className="relative" style={{ flex: '0 0 auto' }}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            width={300}
            height={200}
            className="object-cover"
            style={{ width: '100%', height: '200px', borderRadius: '0' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-50" style={{ height: '200px' }}>
            <ImageIcon className="h-16 w-16 mb-2" />
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>
      
      {/* Content Container */}
      <div style={{ padding: '18px', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '17px', 
          fontWeight: '600',
          color: '#1f2937',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.title}
        </h3>
        
        {/* Separator */}
        <div style={{ 
          width: '100%', 
          height: '1px', 
          backgroundColor: '#e5e7eb', 
          margin: '10px 0' 
        }}></div>
        
        {/* Condition and Category */}
        <div style={{ 
          fontSize: '13px', 
          color: '#6b7280', 
          marginBottom: '14px',
          fontWeight: '500',
          lineHeight: '1.4',
          flex: '1 1 auto'
        }}>
          <div>Condition: {item.condition || 'Good'}</div>
          <div>Category: {item.category || 'General'}</div>
        </div>
        
        {/* Price and Offers */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'auto',
          minHeight: '24px',
          flex: '0 0 auto'
        }}>
          <div style={{ 
            fontSize: '19px', 
            fontWeight: '700',
            color: '#059669',
            display: 'flex',
            alignItems: 'center'
          }}>
            <DollarSign className="h-4 w-4" style={{ marginRight: '1px' }} />
            {item.price.toFixed(2)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            fontWeight: '500',
            textAlign: 'right'
          }}>
            Total Offers: {offersCount}
          </div>
        </div>
      </div>
    </div>
  )
}
