import Navigation from '@/components/Navigation'
import ItemsList from '@/components/ItemsList'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">

        </div>
        
        <ItemsList />
      </main>
    </div>
  )
}
