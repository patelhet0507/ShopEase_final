import axios from 'axios'

const DEFAULT_API_URL = 'https://shopease-final.vercel.app'
const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('shopease_user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      if (user && user.id) {
        config.params = config.params || {}
        config.params.user_id = Number(user.id)
      }
    } catch (e) {
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('shopease_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  verifyEmail: (token) => api.get('/api/auth/verify-email', { params: { token } }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
}

export const usersApi = {
  list: () => api.get('/api/users/'),
  updateRole: (userId, role) => api.put(`/api/users/${userId}/role/`, { role }),
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (profileData) => api.put('/api/users/me', profileData),
}

export const categoriesApi = {
  list: () => api.get('/api/categories/'),
  listWithStructure: () => api.get('/api/categories/with-structure'),
  getBySlug: (slug) => api.get(`/api/categories/slug/${slug}`),
  get: (id) => api.get(`/api/categories/${id}/`),
  create: (data) => api.post('/api/categories/', data),
  update: (id, data) => api.put(`/api/categories/${id}/`, data),
  delete: (id) => api.delete(`/api/categories/${id}/`),
}

export const subcategoriesApi = {
  list: () => api.get('/api/subcategories/'),
  getBySlug: (slug) => api.get(`/api/subcategories/slug/${slug}`),
  get: (id) => api.get(`/api/subcategories/${id}/`),
  create: (data) => api.post('/api/subcategories/', data),
  update: (id, data) => api.put(`/api/subcategories/${id}/`),
  delete: (id) => api.delete(`/api/subcategories/${id}/`),
}

export const productsApi = {
  list: (filters) => api.get('/api/products/', { params: filters || {} }),
  getBySlug: (slug) => api.get(`/api/products/slug/${slug}`),
  get: (id) => api.get(`/api/products/${id}/`),
  create: (data) => api.post('/api/products/', data),
  update: (id, data) => api.put(`/api/products/${id}/`, data),
  delete: (id) => api.delete(`/api/products/${id}/`),
  updateImages: (id, images) => api.put(`/api/products/${id}/`, { images }),
  getVariants: (productId) => api.get(`/api/products/${productId}/variants/`),
  createVariant: (productId, data) => api.post(`/api/products/${productId}/variants/`, data),
  updateVariant: (productId, variantId, data) => api.put(`/api/products/${productId}/variants/${variantId}/`, data),
  deleteVariant: (productId, variantId) => api.delete(`/api/products/${productId}/variants/${variantId}/`),
}

export const cartApi = {
  get: (userId) => api.get(`/api/users/${userId}/cart/`),
  add: (userId, data) => api.post(`/api/users/${userId}/cart/`, data),
  update: (userId, itemId, data) => api.put(`/api/users/${userId}/cart/${itemId}/`, data),
  remove: (userId, itemId) => api.delete(`/api/users/${userId}/cart/${itemId}/`),
  clear: (userId) => api.delete(`/api/users/${userId}/cart/`),
}

export const wishlistApi = {
  get: (userId) => api.get(`/api/users/${userId}/wishlist/`),
  add: (userId, data) => api.post(`/api/users/${userId}/wishlist/`, data),
  remove: (userId, itemId) => api.delete(`/api/users/${userId}/wishlist/${itemId}/`),
}

export const reviewsApi = {
  list: (productId) => api.get(`/api/products/${productId}/reviews/`),
  getStats: (productId) => api.get(`/api/products/${productId}/reviews/stats`),
  create: (productId, data) => api.post(`/api/products/${productId}/reviews/`, data),
  update: (reviewId, data) => api.put(`/api/reviews/${reviewId}/`, data),
  delete: (reviewId) => api.delete(`/api/reviews/${reviewId}/`),
}

export const ordersApi = {
  list: () => api.get('/api/orders/'),
  get: (orderId) => api.get(`/api/orders/${orderId}/`),
  create: (data) => api.post('/api/orders/', data),
  updateStatus: (orderId, status, note) =>
    api.put(`/api/orders/${orderId}/status`, null, {
      params: { status: status, ...(note ? { note: note } : {}) }
    }),
  getEvents: (orderId) => api.get(`/api/orders/${orderId}/events`),
  adminList: () => api.get('/api/admin/orders/'),
}

export default api
