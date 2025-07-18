import Navigation from '@/components/Navigation'
import ItemsList from '@/components/ItemsList'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ItemsList />
      </main>
    </div>
  )
}
