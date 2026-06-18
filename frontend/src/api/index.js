import axios from 'axios'

const DEFAULT_API_URL = 'https://shopease-backend-0uzd.onrender.com'
const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Automatically attach Bearer token or user_id safely to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Safe URL Search Params Injection
  if (userId) {
    const parsedUserId = parseInt(userId, 10)
    if (!isNaN(parsedUserId)) {
      config.params = {
        ...config.params,
        user_id: parsedUserId
      }
    }
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// Auth
export const authApi = {
  register: (email, password) =>
    api.post('/api/auth/register', { email, password }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
}

// Users & Profiles
export const usersApi = {
  list: () => api.get('/api/users/'),
  updateRole: (userId, role) =>
    api.put(`/api/users/${userId}/role/`, { role }),
  getProfile: () => 
    api.get('/api/users/me'),
  updateProfile: (profileData) =>
    api.put('/api/users/me', profileData),
}

// Categories (Slug Support)
export const categoriesApi = {
  list: () => api.get('/api/categories/'),
  listWithStructure: () => api.get('/api/categories/with-structure'),
  getBySlug: (slug) => api.get(`/api/categories/slug/${slug}`),
  get: (id) => api.get(`/api/categories/${id}/`),
  create: (data) => api.post('/api/categories/', data),
  update: (id, data) => api.put(`/api/categories/${id}/`, data),
  delete: (id) => api.delete(`/api/categories/${id}/`),
}

// Subcategories (Slug Support)
export const subcategoriesApi = {
  list: () => api.get('/api/subcategories/'),
  getBySlug: (slug) => api.get(`/api/subcategories/slug/${slug}`),
  get: (id) => api.get(`/api/subcategories/${id}/`),
  create: (data) => api.post('/api/subcategories/', data),
  update: (id, data) => api.put(`/api/subcategories/${id}/`),
  delete: (id) => api.delete(`/api/subcategories/${id}/`),
}

// Products (Slug Support + Multiple Images + Variants)
export const productsApi = {
  list: (filters = {}) => api.get('/api/products/', { params: filters }),
  getBySlug: (slug) => api.get(`/api/products/slug/${slug}`),
  get: (id) => api.get(`/api/products/${id}/`),
  create: (data) => api.post('/api/products/', data),
  update: (id, data) => api.put(`/api/products/${id}/`, data),
  delete: (id) => api.delete(`/api/products/${id}/`),
  
  updateImages: (id, images) => 
    api.put(`/api/products/${id}/`, { images }),
  
  getVariants: (productId) => 
    api.get(`/api/products/${productId}/variants/`),
  createVariant: (productId, data) => 
    api.post(`/api/products/${productId}/variants/`, data),
  updateVariant: (productId, variantId, data) => 
    api.put(`/api/products/${productId}/variants/${variantId}/`, data),
  deleteVariant: (productId, variantId) => 
    api.delete(`/api/products/${productId}/variants/${variantId}/`),
}

// Cart
export const cartApi = {
  get: (userId) => api.get(`/api/users/${userId}/cart/`),
  add: (userId, data) => api.post(`/api/users/${userId}/cart/`, data),
  update: (userId, itemId, data) => 
    api.put(`/api/users/${userId}/cart/${itemId}/`, data),
  remove: (userId, itemId) => 
    api.delete(`/api/users/${userId}/cart/${itemId}/`),
  clear: (userId) => api.delete(`/api/users/${userId}/cart/`),
}

// Wishlist
export const wishlistApi = {
  get: (userId) => api.get(`/api/users/${userId}/wishlist/`),
  add: (userId, data) => api.post(`/api/users/${userId}/wishlist/`, data),
  remove: (userId, itemId) => 
    api.delete(`/api/users/${userId}/wishlist/${itemId}/`),
}

// Reviews
export const reviewsApi = {
  list: (productId) => api.get(`/api/products/${productId}/reviews/`),
  getStats: (productId) => api.get(`/api/products/${productId}/reviews/stats`),
  create: (productId, data) => api.post(`/api/products/${productId}/reviews/`, data),
  update: (reviewId, data) => api.put(`/api/reviews/${reviewId}/`, data),
  delete: (reviewId) => api.delete(`/api/reviews/${reviewId}/`),
}

// Orders
export const ordersApi = {
  list: (userId) => api.get(`/api/orders/`),
  get: (orderId, userId) => api.get(`/api/orders/${orderId}/`),
  create: (userId, data) => api.post('/api/orders/', data),
  updateStatus: (orderId, status) => 
    api.put(`/api/orders/${orderId}/status`, null, { params: { status } }),
}

export default api