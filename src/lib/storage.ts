import { supabase } from './supabase'

export interface UploadResult {
  url: string | null
  error: string | null
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'item-images')
 * @returns Promise with the public URL or error
 */
export async function uploadImage(
  file: File,
  bucket: string = 'item-images'
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Please select an image file' }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return { url: null, error: 'Image size must be less than 5MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `items/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return { url: null, error: 'An unexpected error occurred during upload' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full public URL of the image
 * @param bucket - The storage bucket name (default: 'item-images')
 * @returns Promise with success status
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'item-images'
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extract file path from public URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === bucket)
    
    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return { success: false, error: 'Invalid image URL' }
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: 'Failed to delete image' }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return { success: false, error: 'An unexpected error occurred during deletion' }
  }
}

/**
 * Get optimized image URL with transformations
 * @param imageUrl - The original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!imageUrl) return ''
  
  // If it's already a Supabase URL, we can add transformations
  if (imageUrl.includes('supabase')) {
    const url = new URL(imageUrl)
    const params = new URLSearchParams()
    
    if (width) params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    params.set('quality', quality.toString())
    
    if (params.toString()) {
      url.search = params.toString()
    }
    
    return url.toString()
  }
  
  return imageUrl
}
