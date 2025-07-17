'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Item } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DollarSign, ImageIcon, Star } from 'lucide-react'

interface ItemCardProps {
  item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth()
  const isOwner = user?.id === item.user_id

  return (
    <Link href={`/items/${item.id}`} className="block">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-80 flex flex-col justify-between cursor-pointer">
        {/* Image Container */}
        <div className="relative h-40 overflow-hidden rounded">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded">
              <ImageIcon className="h-12 w-12 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}
          
          {/* Owner Badge */}
          {isOwner && (
            <div className="absolute top-2 right-2">
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Star className="h-3 w-3" />
                Your Item
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between mt-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
              {item.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.description}
            </p>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-900 font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              <span>{item.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
