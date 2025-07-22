// Application constants for Joynest e-commerce platform

export const ITEM_CONDITIONS = [
  'new',
  'like new',
  'good',
  'fair',
  'poor'
] as const

export const ITEM_CATEGORIES = [
  'electronics',
  'clothing',
  'books',
  'furniture',
  'sports',
  'toys',
  'jewelry',
  'art',
  'collectibles',
  'automotive',
  'home & garden',
  'music',
  'other'
] as const

export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
} as const

export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  NEW_ITEM: '/items/new',
  ITEM_DETAIL: (id: string) => `/items/${id}`,
  EDIT_ITEM: (id: string) => `/items/${id}/edit`
} as const

export const MESSAGES = {
  PURCHASE_SUCCESS: 'Purchase successful! The item is now yours.',
  PURCHASE_FAILED: 'Purchase failed. Please try again.',
  ITEM_ALREADY_SOLD: 'This item has already been sold.',
  LOGIN_REQUIRED: 'Please log in to continue.',
  OFFER_SUBMITTED: 'Your offer has been submitted!',
  OFFER_ACCEPTED: 'Offer accepted successfully!',
  OFFER_REJECTED: 'Offer rejected successfully!',
  ITEM_DELETED: 'Item deleted successfully.',
  ITEM_CREATED: 'Item published successfully!',
  ITEM_UPDATED: 'Item updated successfully!'
} as const

export const UI_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEBOUNCE_DELAY: 300
} as const
