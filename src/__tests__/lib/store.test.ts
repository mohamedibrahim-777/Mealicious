import { useAppStore } from '@/lib/store'
import { useCatalogStore } from '@/lib/catalog-store'

describe('AppStore', () => {
  it('should initialize with home page', () => {
    const state = useAppStore.getState()
    expect(state.currentPage).toBe('home')
    expect(state.isLoggedIn).toBe(false)
  })

  it('should have navigate method', () => {
    const store = useAppStore.getState()
    expect(typeof store.navigate).toBe('function')
  })

  it('should have auth methods', () => {
    const store = useAppStore.getState()
    expect(typeof store.login).toBe('function')
    expect(typeof store.logout).toBe('function')
  })
})

describe('CatalogStore', () => {
  it('should have products state', () => {
    const store = useCatalogStore.getState()
    expect(Array.isArray(store.products)).toBe(true)
  })

  it('should have CRUD methods for all sections', () => {
    const store = useCatalogStore.getState()
    const methods = [
      'loadProducts', 'addProduct', 'updateProduct', 'deleteProduct',
      'loadCategories', 'addCategory', 'updateCategory', 'deleteCategory',
      'loadCoupons', 'addCoupon', 'updateCoupon', 'deleteCoupon',
      'loadBanners', 'addBanner', 'updateBanner', 'deleteBanner',
      'loadBlogs', 'addBlog', 'updateBlog', 'deleteBlog',
      'loadReviews', 'addReview', 'updateReview', 'deleteReview',
      'loadInventory', 'addInventory', 'updateInventory', 'deleteInventory',
    ]
    methods.forEach(method => {
      expect(typeof store[method as keyof typeof store]).toBe('function')
    })
  })

  it('should have order and user methods', () => {
    const store = useCatalogStore.getState()
    expect(typeof store.loadOrders).toBe('function')
    expect(typeof store.updateOrderStatus).toBe('function')
    expect(typeof store.loadUsers).toBe('function')
  })
})
