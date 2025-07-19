'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import ItemsList from '@/components/ItemsList'

export default function BrowsePage() {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const conditions = ['excellent', 'good', 'fair', 'poor']
  const categories = ['living room', 'bedroom', 'kitchen', 'outdoor', 'electronics', 'clothing', 'books', 'sports']

  const handleConditionChange = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
        <div className="flex gap-8 h-full">
          {/* Filter Sidebar */}
          <div className="w-64 bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">filter</h2>
            
            {/* Condition Filter */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">condition</h3>
              <div className="space-y-3">
                {conditions.map((condition) => (
                  <label key={condition} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(condition)}
                      onChange={() => handleConditionChange(condition)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">
                      {condition}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Category</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <ItemsList 
              selectedConditions={selectedConditions}
              selectedCategories={selectedCategories}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
