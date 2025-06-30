'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { supabase, Item, Offer } from '@/lib/supabase'
import { DollarSign, Edit, Trash2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import Image from 'next/image'

export default function ItemPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [offerAmount, setOfferAmount] = useState('')
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [error, setError] = useState('')

  const itemId = params.id as string
  const isOwner = user?.id === item?.user_id

  useEffect(() => {
    if (itemId) {
      fetchItem()
      fetchOffers()
    }
  }, [itemId])

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (error) {
        console.error('Error fetching item:', error)
        return
      }

      setItem(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching offers:', error)
        return
      }

      setOffers(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!offerAmount || isNaN(parseFloat(offerAmount))) {
      setError('Please enter a valid offer amount')
      return
    }

    setSubmittingOffer(true)
    setError('')

    try {
      const { error } = await supabase
        .from('offers')
        .insert([
          {
            item_id: itemId,
            user_id: user.id,
            amount: parseFloat(offerAmount),
            status: 'pending',
          },
        ])

      if (error) {
        setError('Failed to submit offer: ' + error.message)
        return
      }

      setOfferAmount('')
      fetchOffers()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Unexpected error:', err)
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: action })
        .eq('id', offerId)

      if (error) {
        console.error('Error updating offer:', error)
        return
      }

      fetchOffers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Error deleting item:', error)
        return
      }

      router.push('/')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Item not found</h1>
            <p className="mt-2 text-gray-600">The item you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Item Image */}
          <div className="relative h-64 md:h-96 bg-gray-200">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Eye className="h-24 w-24" />
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Item Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <div className="flex items-center text-green-600 text-xl font-semibold">
                  <DollarSign className="h-5 w-5" />
                  <span>{item.price.toFixed(2)}</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/items/${item.id}/edit`)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Item Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Make Offer Section */}
            {!isOwner && user && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Make an Offer</h2>
                <form onSubmit={handleSubmitOffer} className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your offer"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingOffer}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </form>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800">
                    <a href="/auth/login" className="font-medium hover:underline">
                      Sign in
                    </a>{' '}
                    or{' '}
                    <a href="/auth/register" className="font-medium hover:underline">
                      create an account
                    </a>{' '}
                    to make an offer on this item.
                  </p>
                </div>
              </div>
            )}

            {/* Offers Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Offers ({offers.length})
              </h2>
              
              {offers.length === 0 ? (
                <p className="text-gray-600">No offers yet.</p>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{offer.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {offer.status === 'pending' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600">Pending</span>
                            </>
                          )}
                          {offer.status === 'accepted' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Accepted</span>
                            </>
                          )}
                          {offer.status === 'rejected' && (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Rejected</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isOwner && offer.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOfferAction(offer.id, 'accepted')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOfferAction(offer.id, 'rejected')}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
