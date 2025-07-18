'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import ImageUpload from '@/components/ImageUpload'
import { supabase, Item } from '@/lib/supabase'

export default function EditItemPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('Good')
  const [category, setCategory] = useState('Kitchen')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const itemId = params.id as string

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (itemId && user) {
      fetchItem()
    }
  }, [itemId, user])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (error) {
        console.error('Error fetching item:', error)
        router.push('/profile')
        return
      }

      // Check if user owns this item
      if (data.user_id !== user.id) {
        router.push('/profile')
        return
      }

      setItem(data)
      setTitle(data.title)
      setDescription(data.description)
      setPrice(data.price.toString())
      setCondition(data.condition || 'Good')
      setCategory(data.category || 'Kitchen')
      setImageUrl(data.image_url || null)
    } catch (error) {
      console.error('Error:', error)
      router.push('/profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price')
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase
        .from('items')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: priceValue,
          condition: condition,
          category: category,
          image_url: imageUrl || null,
        })
        .eq('id', itemId)

      if (error) {
        setError('Failed to update item: ' + error.message)
        return
      }

      router.push(`/items/${itemId}`)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Unexpected error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Item not found</h1>
            <p className="mt-2 text-gray-600">The item you&apos;re trying to edit doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex justify-center items-center pt-10 pb-20 px-5">
        {/* Container for both text and form */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          maxWidth: '1200px'
        }}>
          {/* Left side - Header text */}
          <div 
            className="left-container"
            style={{
              maxWidth: '400px',
              backgroundColor: 'rgba(255, 255, 255, 0)',
              padding: '20px',
              textAlign: 'left',
              color: '#333'
            }}
          >
            <h2 style={{
              fontSize: '3.5em',
              margin: '30px',
              textShadow: '2px 2px 5px rgba(181, 178, 178, 0.5)'
            }}>
              Update Listing
            </h2>
            <p style={{ margin: '30px' }}>
              Modify your item details, update condition, category,<br />
              pricing, and other information as needed.
            </p>
          </div>
        
          {/* Right side - Form container */}
          <div 
            className="listing-section"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'left',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(89, 74, 48, 0.4)',
              borderRadius: '10px',
              backgroundColor: '#333',
              color: '#fff',
              width: '520px',
              maxHeight: '600px',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.2em' }}>Edit Item</h2>
            
            <form 
              onSubmit={handleSubmit} 
              style={{ maxWidth: '520px', width: '100%' }}
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {/* First row - Item Name, Seller, Condition */}
              <div 
                className="form-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <div 
                  className="form-group"
                  style={{
                    flex: 1,
                    marginRight: '12px',
                    marginTop: '15px'
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Item Name:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div 
                  className="form-group"
                  style={{
                    flex: 1,
                    marginRight: '12px',
                    marginTop: '20px'
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Seller:
                  </label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      boxSizing: 'border-box',
                      backgroundColor: '#f0f0f0',
                      color: '#666'
                    }}
                  />
                </div>
                <div 
                  className="form-group"
                  style={{
                    flex: 1,
                    marginRight: '0',
                    marginTop: '20px'
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Condition:
                  </label>
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Mint">Mint</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* Second row - Department/Category and Price */}
              <div 
                className="form-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <div 
                  className="form-group"
                  style={{
                    flex: 1,
                    marginRight: '12px',
                    marginTop: '20px'
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Department/Category:
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Office">Office</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div 
                  className="form-group"
                  style={{
                    flex: 1,
                    marginRight: '0',
                    marginTop: '20px'
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Price:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="$0.00"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div 
                className="form-group"
                style={{
                  flex: 1,
                  marginRight: '0',
                  marginTop: '15px'
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Description:
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Describe your item in detail..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div 
                className="form-group"
                style={{
                  flex: 1,
                  marginRight: '0',
                  marginTop: '15px'
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Image:
                </label>
                <div className="compact-image-upload">
                  <ImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '13px',
                  backgroundColor: saving ? '#ccc' : '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                  width: '100%',
                  marginTop: '15px'
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }
                }}
                onMouseOut={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                  }
                }}
              >
                {saving ? 'Updating...' : 'Update Item'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
