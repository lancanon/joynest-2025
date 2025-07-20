'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { supabase, Item, Offer, Profile, getDisplayName } from '@/lib/supabase'
import { DollarSign, Edit, Trash2, Clock, CheckCircle, XCircle, Eye, ShoppingCart, MessageSquare } from 'lucide-react'
import Image from 'next/image'

// Styles object
const styles = {
  container: { display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '1200px', marginTop: '-120px' },
  imageContainer: { width: '500px', height: '500px', backgroundColor: '#f5f5f5', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(89, 74, 48, 0.4)', position: 'relative' as const },
  detailsContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', textAlign: 'left' as const, padding: '30px', boxShadow: '0 4px 8px rgba(89, 74, 48, 0.4)', borderRadius: '10px', backgroundColor: '#333', color: '#fff', width: '500px', minHeight: '500px' },
  formRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  formGroup: { flex: 1, marginRight: '12px' },
  formGroupLast: { flex: 1 },
  input: { padding: '8px', backgroundColor: 'transparent', color: '#fff', borderRadius: '4px', fontWeight: 'bold' },
  inputWithIcon: { padding: '8px', backgroundColor: 'transparent', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', fontWeight: 'bold' },
  description: { padding: '12px', backgroundColor: 'transparent', color: '#fff', borderRadius: '4px', minHeight: '100px', whiteSpace: 'pre-wrap' as const, fontWeight: 'bold' },
  button: { padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', color: '#333' }
}

// Helper Components
const InfoField = ({ label, value, icon, isLast = false }: { label: string; value: string | number; icon?: React.ReactNode; isLast?: boolean }) => (
  <div style={isLast ? styles.formGroupLast : styles.formGroup}>
    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em' }}>{label}:</label>
    <div style={icon ? styles.inputWithIcon : styles.input}>
      {icon && icon}
      <span className={icon ? "font-bold" : "font-bold"}>{value}</span>
    </div>
  </div>
)

const ActionButton = ({ onClick, color, icon, children, disabled = false, style = {} }: { onClick: () => void; color: string; icon: React.ReactNode; children?: React.ReactNode; disabled?: boolean; style?: React.CSSProperties }) => (
  <button onClick={onClick} disabled={disabled} style={{ ...styles.button, backgroundColor: disabled ? '#ccc' : color, color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
    {icon}{children}
  </button>
)

const OfferCard = ({ offer, isOwner, onAction }: { offer: Offer; isOwner: boolean; onAction: (id: string, action: 'accepted' | 'rejected') => void }) => {
  const statusConfig = {
    pending: { icon: <Clock style={{ width: '16px', height: '16px', color: '#ffc107' }} />, color: '#ffc107' },
    accepted: { icon: <CheckCircle style={{ width: '16px', height: '16px', color: '#28a745' }} />, color: '#28a745' },
    rejected: { icon: <XCircle style={{ width: '16px', height: '16px', color: '#dc3545' }} />, color: '#dc3545' }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#28a745', fontWeight: 'bold' }}>
          <DollarSign style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          <span>{offer.amount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {statusConfig[offer.status].icon}
          <span style={{ color: statusConfig[offer.status].color, fontSize: '0.9em' }}>
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
        </div>
      </div>
      {offer.status === 'pending' && isOwner && (
        <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
          <ActionButton onClick={() => onAction(offer.id, 'accepted')} color="#28a745" icon={<CheckCircle className="h-5 w-5" />} style={{ padding: '8px', fontSize: '0.9em', minWidth: 'auto' }}></ActionButton>
          <ActionButton onClick={() => onAction(offer.id, 'rejected')} color="#dc3545" icon={<XCircle className="h-5 w-5" />} style={{ padding: '8px', fontSize: '0.9em', minWidth: 'auto' }}></ActionButton>
        </div>
      )}
    </div>
  )
}

// Loading state component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="min-h-screen flex justify-center items-center pt-10 pb-20 px-5">
      <div className="animate-pulse flex gap-16 max-w-6xl">
        <div className="w-96 h-96 bg-gray-200 rounded-lg"></div>
        <div className="w-96 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
)

// Not found state component
const NotFoundState = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="min-h-screen flex justify-center items-center pt-10 pb-20 px-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Item not found</h1>
        <p className="mt-2 text-gray-600">The item you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  </div>
)

export default function ItemPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [seller, setSeller] = useState<Profile | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [offerAmount, setOfferAmount] = useState('')
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [showOffers, setShowOffers] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [error, setError] = useState('')

  const itemId = params.id as string
  const isOwner = useMemo(() => user?.id === item?.user_id, [user?.id, item?.user_id])

  const fetchItem = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('items').select('*').eq('id', itemId).single()
      if (error) {
        console.error('Error fetching item:', error)
        return
      }
      
      setItem(data)
      
      if (data.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .single()
        
        if (profileError) {
          console.log('Profile not found for user:', data.user_id, profileError)
          // If no profile exists, we'll show "Unknown User" via getDisplayName
          setSeller(null)
        } else {
          setSeller(profileData)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  const fetchOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('offers').select('*').eq('item_id', itemId).order('created_at', { ascending: false })
      if (!error) setOffers(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }, [itemId])

  useEffect(() => {
    if (itemId) {
      fetchItem()
      fetchOffers()
    }
  }, [itemId, fetchItem, fetchOffers])

  const handleSubmitOffer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    const amount = parseFloat(offerAmount)
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid offer amount')
      return
    }

    setSubmittingOffer(true)
    setError('')

    try {
      const { error } = await supabase.from('offers').insert([{ 
        item_id: itemId, 
        user_id: user.id, 
        amount, 
        status: 'pending' 
      }])
      
      if (error) {
        setError('Failed to submit offer: ' + error.message)
        return
      }
      
      setOfferAmount('')
      setShowOfferModal(false)
      fetchOffers()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmittingOffer(false)
    }
  }, [user, offerAmount, itemId, router, fetchOffers])

  const handleOfferAction = useCallback(async (offerId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase.from('offers').update({ status: action }).eq('id', offerId)
      if (error) {
        alert(`Failed to ${action} offer: ${error.message}`)
        return
      }
      fetchOffers()
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred')
    }
  }, [fetchOffers])

  const handleDeleteItem = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId)
      if (!error) router.push('/')
    } catch (error) {
      console.error('Error:', error)
    }
  }, [itemId, router])

  // Memoize computed values
  const pendingOffers = useMemo(() => offers.filter(offer => offer.status === 'pending'), [offers])
  const sellerName = useMemo(() => getDisplayName(seller), [seller])

  // Early returns for loading and error states
  if (loading) {
    return <LoadingState />
  }

  if (!item) {
    return <NotFoundState />
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex justify-center items-center pt-10 pb-20 px-5">
        <div style={styles.container}>
          {/* Item Image */}
          <div style={styles.imageContainer}>
            {item.image_url ? (
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Eye className="h-24 w-24" />
              </div>
            )}
          </div>
        
          {/* Item Details */}
          <div style={styles.detailsContainer}>
            <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>{item.title}</h2>
            
            <div style={{ width: '100%', flex: 1 }}>
              {/* Item Info */}
              <div style={styles.formRow}>
                <InfoField label="Price" value={item.price.toFixed(2)} icon={<DollarSign className="h-4 w-4 mr-1" />} />
                <InfoField label="Condition" value={item.condition || 'N/A'} />
                <InfoField label="Category" value={item.category || 'N/A'} isLast />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <InfoField label="Seller" value={sellerName} isLast />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em' }}>Description:</label>
                <div style={styles.description}>{item.description}</div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '20px' }}>
                {isOwner ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <ActionButton onClick={() => router.push(`/items/${item.id}/edit`)} color="#4CAF50" icon={<Edit className="h-4 w-4" />} style={{ flex: 1 }}>Edit</ActionButton>
                    <ActionButton onClick={handleDeleteItem} color="#dc3545" icon={<Trash2 className="h-4 w-4" />} style={{ flex: 1 }}>Delete</ActionButton>
                  </div>
                ) : user ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <ActionButton onClick={() => {}} color="#007bff" icon={<ShoppingCart className="h-4 w-4" />} style={{ flex: 1 }}>Buy Now</ActionButton>
                  </div>
                ) : (
                  <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '5px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, textAlign: 'center' }}>
                      <a href="/auth/login" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Sign in</a> or <a href="/auth/register" style={{ color: '#60a5fa', textDecoration: 'underline' }}>create an account</a> to buy or make offers.
                    </p>
                  </div>
                )}

                {/* Place Offer Button */}
                {!isOwner && user && (
                  <button 
                    onClick={() => setShowOfferModal(true)} 
                    style={{ 
                      width: '100%', 
                      padding: '12px 20px', 
                      backgroundColor: '#28a745', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    Place Offer
                  </button>
                )}

                {/* View Offers Button */}
                {isOwner && (
                  <ActionButton onClick={() => setShowOffers(!showOffers)} color="#6c757d" icon={<MessageSquare className="h-4 w-4" />} style={{ width: '100%' }}>
                    {showOffers ? 'Hide' : 'View'} Offers ({offers.length})
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Modal */}
      {showOffers && isOwner && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5em' }}>Offers ({offers.length})</h3>
              <button onClick={() => setShowOffers(false)} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            {offers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No offers yet.</p>
            ) : (
              <div>
                {pendingOffers.length === 0 && offers.length > 0 && (
                  <p style={{ textAlign: 'center', color: '#666', marginBottom: '15px', fontSize: '0.9em' }}>
                    All offers have been processed. No pending offers to review.
                  </p>
                )}
                {offers.map(offer => <OfferCard key={offer.id} offer={offer} isOwner={isOwner} onAction={handleOfferAction} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5em' }}>Make an Offer</h3>
              <button onClick={() => setShowOfferModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            <form onSubmit={handleSubmitOffer}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '1em', fontWeight: 'bold' }}>Your Offer Amount:</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', width: '20px', height: '20px' }} />
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={offerAmount} 
                    onChange={(e) => setOfferAmount(e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '12px 12px 12px 40px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '1.1em',
                      color: '#333',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                    placeholder="Enter offer amount" 
                    required 
                    autoFocus
                  />
                </div>
              </div>
              {error && <p style={{ color: '#dc3545', fontSize: '0.9em', marginBottom: '15px' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowOfferModal(false)} 
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    backgroundColor: '#6c757d', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingOffer} 
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    backgroundColor: submittingOffer ? '#ccc' : '#28a745', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: submittingOffer ? 'not-allowed' : 'pointer',
                    fontSize: '1em',
                    fontWeight: 'bold'
                  }}
                >
                  {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
