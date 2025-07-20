'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import ImageUpload from '@/components/ImageUpload'
import { supabase } from '@/lib/supabase'

export default function NewItemPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('Mint')
  const [category, setCategory] = useState('Kitchen')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Memoize styles for better performance
  const containerStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '60px',
    maxWidth: '1200px'
  }), [])

  const leftContainerStyles = useMemo(() => ({
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    padding: '20px',
    textAlign: 'left' as const,
    color: '#333',
    flexShrink: 0
  }), [])

  const formContainerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'left' as const,
    padding: '20px',
    boxShadow: '0 4px 8px rgba(89, 74, 48, 0.4)',
    borderRadius: '10px',
    backgroundColor: '#333',
    color: '#fff',
    width: '480px',
    minHeight: '600px',
    maxHeight: '650px',
    overflow: 'hidden'
  }), [])

  const formStyles = useMemo(() => ({
    maxWidth: '480px',
    width: '100%',
    height: '100%',
    overflow: 'auto'
  }), [])

  // Handle form submission with useCallback for optimization
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price')
      setLoading(false)
      return
    }

    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            price: priceValue,
            condition: condition,
            category: category,
            image_url: imageUrl || null,
            user_id: user.id,
          },
        ])
        .select()

      if (error) {
        setError('Failed to create item: ' + error.message)
        return
      }

      // Redirect to the new item's page
      if (data && data[0]) {
        router.push(`/items/${data[0].id}`)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }, [title, description, price, condition, category, imageUrl, user, router])

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

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

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex justify-center items-center pt-10 pb-20 px-5" style={{ marginTop: '-20px' }}>
        {/* Container for both text and form */}
        <div style={containerStyles}>
          {/* Left side - Header text */}
          <div className="left-container" style={leftContainerStyles}>
            <h2 style={{
              fontSize: '3.5em',
              margin: '30px',
              textShadow: '2px 2px 5px rgba(181, 178, 178, 0.5)'
            }}>
              Start Listing
            </h2>
            <p style={{ margin: '30px' }}>
              Add details about condition, listed category,<br />
              additional measurements, shipping policies, etc.
            </p>
          </div>
        
          {/* Right side - Form container */}
          <div className="listing-section" style={formContainerStyles}>
        <h2 style={{ fontSize: '1.2em' }}>List New Item</h2>
        
        <form onSubmit={handleSubmit} style={formStyles}>
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
              marginBottom: '12px'
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
              marginBottom: '12px'
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
              marginTop: '20px'
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
              marginTop: '20px'
            }}
          >
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Image:
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              width: '100%',
              marginTop: '20px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#45a049';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#4CAF50';
              }
            }}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      </div>
        </div>
      </div>
    </>
  )
}
