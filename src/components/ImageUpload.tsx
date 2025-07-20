'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { uploadImage, deleteImage } from '@/lib/storage'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  disabled?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (disabled) return

    setUploading(true)
    
    try {
      // Delete existing image if there is one
      if (value) {
        await deleteImage(value)
      }

      const result = await uploadImage(file)
      
      if (result.error) {
        alert(result.error)
      } else {
        onChange(result.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = async () => {
    if (disabled || !value) return

    try {
      await deleteImage(value)
      onChange(null)
    } catch (error) {
      console.error('Delete error:', error)
      // Still remove from UI even if deletion fails
      onChange(null)
    }
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <div className="relative">
          <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Remove image"
              >
                <X className="h-3 w-3 text-gray-600" />
              </button>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploading}
              className="mt-2 w-full py-1 px-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-3 transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span>
                    {' or drag and drop'}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-gray-600">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
