'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ItemsList from '@/components/ItemsList'

export default function BrowsePage() {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [conditionExpanded, setConditionExpanded] = useState(true)
  const [categoryExpanded, setCategoryExpanded] = useState(true)

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{marginTop: '40px'}}>
        <div className="flex gap-12">
          
          {/* FILTER SIDEBAR */}
          <div className="w-[250px]">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              
              {/* Category Filter */}
              <div className="mb-10 ml-6" style={{marginTop: '100px', marginLeft: '30px'}}>
                <div 
                  onClick={() => setCategoryExpanded(!categoryExpanded)}
                  className="flex items-end justify-between cursor-pointer mb-6 pb-3 h-16"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Category</h2>
                  {categoryExpanded ? (
                    <Minus className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                {categoryExpanded && (
                  <div className="space-y-4" style={{marginTop: '20px',marginLeft: '30px'}}>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg text-gray-700 capitalize font-medium">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Condition Filter */}
              <div className="mb-10 ml-6" style={{marginTop: '20px',marginLeft: '30px'}}>
                <div 
                  onClick={() => setConditionExpanded(!conditionExpanded)}
                  className="flex items-end justify-between cursor-pointer mb-6 pb-3 h-16"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Condition</h2>
                  {conditionExpanded ? (
                    <Minus className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                {conditionExpanded && (
                  <div className="space-y-4" style={{marginTop: '20px', marginLeft: '30px'}}>
                    {conditions.map((condition) => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedConditions.includes(condition)}
                          onChange={() => handleConditionChange(condition)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg text-gray-700 capitalize font-medium">
                          {condition}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{marginLeft: '200px'}}>Browse Items</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ItemsList 
                selectedConditions={selectedConditions}
                selectedCategories={selectedCategories}
              />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
