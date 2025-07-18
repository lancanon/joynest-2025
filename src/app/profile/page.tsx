'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { supabase, Item, Profile, Offer } from '@/lib/supabase'
import ItemCard from '@/components/ItemCard'
import { User, Package, DollarSign, Clock, CheckCircle, XCircle, Plus, ShoppingBag, TrendingUp, Handshake, Star } from 'lucide-react'

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
    if (userItems.length > 0) {
      fetchOffers()
    }
  }, [userItems])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!user) {
    return null
  }

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error - ignore this as it means profile doesn't exist yet
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchUserItems = async () => {
    if (!user) return

    try {
      // Get all user items
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user items:', error)
        return
      }

      // For now, we'll consider all items as "selling" since we don't have a sold status
      // In a real app, you might have a status field to differentiate
      setUserItems(data || [])
      
      // Mock sold items (you can implement this based on your business logic)
      // For example, items with accepted offers could be considered sold
      setSoldItems([]) // For now, empty array
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    if (!user) return

    try {
      // First, get all offers for the user's items
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .in('item_id', userItems.map(item => item.id))
        .order('created_at', { ascending: false })

      if (offersError) {
        console.error('Error fetching offers:', offersError)
        return
      }

      // Then get the item details for each offer
      const offersWithDetails = await Promise.all(
        (offersData || []).map(async (offer) => {
          const item = userItems.find(item => item.id === offer.item_id)
          
          // Get username from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', offer.user_id)
            .single()

          const username = profileData?.username || `User-${offer.user_id.substring(0, 8)}`

          return {
            ...offer,
            item: item || { id: '', title: 'Unknown Item', price: 0, image_url: null },
            user_email: username
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

  const totalValue = userItems.reduce((sum, item) => sum + item.price, 0)
  const pendingOffers = offers.filter(offer => offer.status === 'pending').length
  const soldValue = soldItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" style={{
      backgroundImage: "url('/images/contentBg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {profile?.username ? `@${profile.username}` : 'Your Profile'}
                  </h1>
                  <p className="text-gray-600 text-lg">{user.email}</p>
                  {profile?.full_name && (
                    <p className="text-gray-500 mt-1">{profile.full_name}</p>
                  )}
                </div>
              </div>
            </div>
        </div>        {/* Modern Dashboard Layout */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Modern Sidebar */}
            <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-6">
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Dashboard</h2>
                
                <button
                  onClick={() => setActiveTab('selling')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    activeTab === 'selling'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md hover:scale-102'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Selling</div>
                    <div className="text-sm opacity-75">{userItems.length} items</div>
                  </div>
                  {activeTab === 'selling' && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('sold')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    activeTab === 'sold'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md hover:scale-102'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Sold</div>
                    <div className="text-sm opacity-75">{soldItems.length} items</div>
                  </div>
                  {activeTab === 'sold' && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('offers')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    activeTab === 'offers'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md hover:scale-102'
                  }`}
                >
                  <Handshake className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Offers</div>
                    <div className="text-sm opacity-75">{offers.length} total</div>
                  </div>
                  {pendingOffers > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      {pendingOffers}
                    </div>
                  )}
                  {activeTab === 'offers' && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-white/50 backdrop-blur-sm">
              {activeTab === 'selling' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Active Listings</h3>
                      <p className="text-gray-600">Manage your items currently for sale</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse"></div>
                      ))}
                    </div>
                  ) : userItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <Package className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
                      <p className="text-gray-600 mb-6">Start selling by adding your first item!</p>
                      <a
                        href="/items/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="h-5 w-5" />
                        Add Your First Item
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userItems.map((item) => (
                        <ItemCard key={`${item.id}-${user?.id || 'anonymous'}`} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sold' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Sold Items</h3>
                      <p className="text-gray-600">Your completed sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Earned</p>
                      <p className="text-xl font-bold text-green-600">${soldValue.toFixed(2)}</p>
                    </div>
                  </div>

                  {soldItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <TrendingUp className="h-16 w-16 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No sales yet</h3>
                      <p className="text-gray-600">Your sold items will appear here once you complete sales.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {soldItems.map((item) => (
                        <div key={item.id} className="relative">
                          <ItemCard item={item} />
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Sold
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'offers' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Offers on Your Items</h3>
                      <p className="text-gray-600">Manage incoming offers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Offers</p>
                      <p className="text-xl font-bold text-purple-600">{offers.length}</p>
                    </div>
                  </div>

                  {offers.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <Handshake className="h-16 w-16 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers yet</h3>
                      <p className="text-gray-600">When people make offers on your items, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {offer.item.title}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  By: <span className="font-medium">{offer.user_email}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(offer.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Offer</p>
                                <p className="text-lg font-bold text-green-600">
                                  ${offer.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  List: ${offer.item.price.toFixed(2)}
                                </p>
                              </div>

                              <div className="flex space-x-1">
                                {offer.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleOfferAction(offer.id, 'accepted')}
                                      disabled={updatingOffer === offer.id}
                                      className="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleOfferAction(offer.id, 'rejected')}
                                      disabled={updatingOffer === offer.id}
                                      className="inline-flex items-center px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </button>
                                  </>
                                )}
                                
                                {offer.status === 'accepted' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Accepted
                                  </span>
                                )}
                                
                                {offer.status === 'rejected' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <XCircle className="h-3 w-3 mr-1" />
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
          </div>
        </div>
      </div>
    </div>
  )
}
