'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    
    setLoading(false)
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
              Welcome Back
            </h2>
            <p style={{ margin: '30px' }}>
              Sign in to your account to continue managing<br />
              your marketplace listings and offers.
            </p>
          </div>
        
          {/* Right side - Form container */}
          <div 
            className="auth-section"
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
              width: '420px',
              maxHeight: '500px'
            }}
          >
            <h2 style={{ fontSize: '1.2em', marginBottom: '20px' }}>Sign In</h2>
            
            <form 
              onSubmit={handleSubmit} 
              style={{ maxWidth: '420px', width: '100%' }}
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <div 
                className="form-group"
                style={{
                  marginBottom: '20px'
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Email Address:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '10px',
                    boxSizing: 'border-box',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                  placeholder="Enter your email"
                />
              </div>
              
              <div 
                className="form-group"
                style={{
                  marginBottom: '20px'
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      marginBottom: '10px',
                      boxSizing: 'border-box',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

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
                  marginTop: '10px',
                  fontSize: '16px',
                  fontWeight: '500'
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '20px', 
                paddingTop: '15px', 
                borderTop: '1px solid #555' 
              }}>
                <p style={{ fontSize: '14px', color: '#ccc' }}>
                  Don't have an account?{' '}
                  <Link
                    href="/auth/register"
                    style={{ 
                      color: '#4CAF50', 
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
