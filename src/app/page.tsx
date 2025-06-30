import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <div className="index-section">
        <div className="background-image"></div>
        <div className="introduction-banner">
          <h1>Joynest</h1>
          <p>Discover Delight, Define Your Home</p>
          <div className="button-container">
            <Link href="/browse" className="button-container1">
              Browse
            </Link>
            <Link href="/items/new" className="button-container1">
              Sell
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
