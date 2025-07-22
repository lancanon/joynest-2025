'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { supabase, Item, Profile, Offer } from '@/lib/supabase'
import ItemCard from '@/components/ItemCard'
import { Package, CheckCircle, XCircle, Plus, Handshake } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userItems, setUserItems] = useState<Item[]>([])
  const [soldItems, setSoldItems] = useState<Item[]>([])
  const [offers, setOffers] = useState<(Offer & { item: Item, user_email: string })[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'selling' | 'sold' | 'offers'>('selling')
  const [updatingOffer, setUpdatingOffer] = useState<string | null>(null)

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserItems()
    }
  }, [user])

  // Fetch offers after userItems are loaded
  useEffect(() => {
    if (user) {
      fetchOffers()
    }
  }, [userItems, user])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchUserItems = async () => {
    try {
      if (!user?.id) return

      const { data: allItems, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (itemsError) {
        console.error('Error fetching items:', itemsError)
        return
      }
      
      // Filter items by sold status
      const activeItems = allItems?.filter(item => !item.is_sold) || allItems || []
      const soldItems = allItems?.filter(item => item.is_sold) || []
      
      setUserItems(activeItems)
      setSoldItems(soldItems)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    try {
      if (!user?.id) return

      if (userItems.length === 0) {
        setOffers([])
        return
      }

      const itemIds = userItems.map(item => item.id)

      const { data: offersData, error } = await supabase
        .from('offers')
        .select(`
          *,
          items (*)
        `)
        .in('item_id', itemIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching offers:', error)
        return
      }

      // Get user info for each offer
      const offersWithDetails = await Promise.all(
        (offersData || []).map(async (offer) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', offer.user_id)
            .single()

          return {
            ...offer,
            item: offer.items,
            user_email: profileData?.full_name || profileData?.username || 'Unknown user'
          }
        })
      )

      setOffers(offersWithDetails)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    setUpdatingOffer(offerId)
    
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: action })
        .eq('id', offerId)

      if (error) {
        console.error('Error updating offer:', error)
        return
      }

      // Refresh offers
      await fetchOffers()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdatingOffer(null)
    }
  }

  const pendingOffers = offers.filter(offer => offer.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{marginTop: '40px'}}>
        
        {/* User Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {profile?.full_name || profile?.username || user?.email || 'Profile'}
          </h1>
          <div className="text-gray-600 text-lg">
            Items Sold: <span className="font-semibold text-gray-900">{soldItems.length}</span>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('selling')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'selling'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Selling ({userItems.length})
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'sold'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sold ({soldItems.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 relative ${
                  activeTab === 'offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Offers ({offers.length})
                {pendingOffers > 0 && (
                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'selling' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Listings ({userItems.length} items)
              </h2>
              
              {loading ? (
                <div className="flex justify-center" style={{marginTop: '20px'}}>
                  <div 
                    className="grid gap-6 max-w-7xl w-full px-4"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(4, 300px)',
                      gap: '2.5rem',
                      justifyContent: 'center'
                    }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : userItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No items listed yet</p>
                  <button
                    onClick={() => router.push('/items/new')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    List Your First Item
                  </button>
                </div>
              ) : (
                <div className="flex justify-center" style={{marginTop: '20px'}}>
                  <div 
                    className="grid gap-6 w-full px-4"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${Math.min(userItems.length, 4)}, 300px)`,
                      gap: '2.5rem',
                      justifyContent: 'center',
                      maxWidth: '1400px'
                    }}
                  >
                    {userItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sold' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sold Items ({soldItems.length} items)
              </h2>
              
              {loading ? (
                <div className="flex justify-center" style={{marginTop: '20px'}}>
                  <div 
                    className="grid gap-6 max-w-7xl w-full px-4"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(4, 300px)',
                      gap: '2.5rem',
                      justifyContent: 'center'
                    }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : soldItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items sold yet</p>
                  <p className="text-gray-400">Keep listing items to make your first sale!</p>
                </div>
              ) : (
                <div className="flex justify-center" style={{marginTop: '20px'}}>
                  <div 
                    className="grid gap-6 w-full px-4"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${Math.min(soldItems.length, 4)}, 300px)`,
                      gap: '2.5rem',
                      justifyContent: 'center',
                      maxWidth: '1400px'
                    }}
                  >
                    {soldItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Offers on Your Items ({offers.length} total)
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12">
                  <Handshake className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No offers received yet</p>
                  <p className="text-gray-400">List more items to start receiving offers!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {offer.item.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            From: {offer.user_email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(offer.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Offer Amount</p>
                            <p className="text-xl font-bold text-green-600">
                              ${offer.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Listed at: ${offer.item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex space-x-2">
                            {offer.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleOfferAction(offer.id, 'accepted')}
                                  disabled={updatingOffer === offer.id}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleOfferAction(offer.id, 'rejected')}
                                  disabled={updatingOffer === offer.id}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {offer.status === 'accepted' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accepted
                              </span>
                            )}
                            
                            {offer.status === 'rejected' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
      </main>
    </div>
  )
}
