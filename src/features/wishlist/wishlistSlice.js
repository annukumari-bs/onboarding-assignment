import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    // An array of product IDs
    items: [],
  },
  reducers: {
    toggleWishlist(state, action) {
      const productId = action.payload;
      const existingIndex = state.items.indexOf(productId);
      
      if (existingIndex >= 0) {
        // Item is in wishlist, so remove it
        state.items.splice(existingIndex, 1);
      } else {
        // Item is not in wishlist, so add it
        state.items.push(productId);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
