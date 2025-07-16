import { createSlice } from '@reduxjs/toolkit'

const paginationSlice = createSlice({
  name: 'pagination',
  initialState: {
    itemsToShow: 6,
  },
  reducers: {
    loadMore(state) {
      state.itemsToShow += 6
    },
    resetPagination(state) {
      state.itemsToShow = 6
    }
  }
})

export const { loadMore, resetPagination } = paginationSlice.actions
export default paginationSlice.reducer
