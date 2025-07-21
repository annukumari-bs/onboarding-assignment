import { createSlice } from '@reduxjs/toolkit'

const filterSlice = createSlice({
  name: 'filters',
  initialState: {
    selectedCategories: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: { key: 'price', direction: 'desc' },
  },
  reducers: {
    setCategory(state, action) {
      const cat = action.payload
      state.selectedCategories = state.selectedCategories.includes(cat)
        ? state.selectedCategories.filter(c => c !== cat)
        : [...state.selectedCategories, cat]
    },
    setPrice(state, action) {
      state.minPrice = action.payload.min
      state.maxPrice = action.payload.max
    },
    setRating(state, action) {
      state.minRating = action.payload
    },
    setSort(state, action) {
      state.sort = action.payload
    },
    clearFilters(state) {
      state.selectedCategories = []
      state.minPrice = ''
      state.maxPrice = ''
      state.minRating = ''
      state.sort = { key: 'rating', direction: 'desc' }
    },
  }
})

export const { setCategory, setPrice, setRating, setSort, clearFilters } = filterSlice.actions
export default filterSlice.reducer
