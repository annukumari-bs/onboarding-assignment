import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartItems, postToCart, deleteCartItem as deleteCartItemAPI } from '../../api/cart/cart';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try { return await getCartItems(); } catch (error) { return rejectWithValue(error.toString()); }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productId, { rejectWithValue }) => {
    try {
      const allCartItems = await getCartItems();
      const existingCartItem = allCartItems.find(item => item.productId === productId);

      if (existingCartItem) {
        const payload = { userId: 1,productId: existingCartItem.id ,quantity: existingCartItem.quantity + 1 };
        return await postToCart( payload);
      } else {
        const payload = { userId: 1, productId, quantity: 1 };
        return await postToCart(payload);
      }
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);


export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId, { rejectWithValue }) => {
    try {
      const allCartItems = await getCartItems();
      const existingCartItem = allCartItems.find(item => item.productId === productId);
      if (!existingCartItem) throw new Error("Item not in cart.");

      if (existingCartItem.quantity > 1) {
        const payload = { userId: 1,productId: existingCartItem.id ,quantity: existingCartItem.quantity - 1 };
        return await postToCart(payload);
      } else {
        await deleteCartItemAPI(existingCartItem.id);
        return { productId: existingCartItem.productId, removed: true };
      }
    } catch (error) { return rejectWithValue(error.toString()); }
});

export const deleteFromCart = createAsyncThunk('cart/deleteFromCart', async (productId, { rejectWithValue }) => {
    try {
      const allCartItems = await getCartItems();
      const existingCartItem = allCartItems.find(item => item.productId === productId);
      if (!existingCartItem) throw new Error("Item not in cart.");
      await deleteCartItemAPI(existingCartItem.id);
      return { productId: existingCartItem.productId, removed: true };
    } catch (error) { return rejectWithValue(error.toString()); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCart(state) {
        state.items = [];
    }
  },
  extraReducers: builder => {
    const handlePending = (state) => { state.status = 'loading'; };
    const handleRejected = (state, action) => { state.status = 'failed'; state.error = action.payload; };
    const handleFulfilled = (state, action) => {
        state.status = 'succeeded';
        const updatedItem = action.payload;
        if (updatedItem.removed) {
            state.items = state.items.filter(item => item.productId !== updatedItem.productId);
        } else {
            const existingItemIndex = state.items.findIndex(item => item.productId === updatedItem.productId);
            if (existingItemIndex >= 0) {
                state.items[existingItemIndex] = updatedItem;
            } else {
                state.items.push(updatedItem);
            }
        }
    };

    builder
      .addCase(fetchCart.pending, handlePending)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, handleRejected)
      .addCase(addToCart.pending, handlePending)
      .addCase(addToCart.fulfilled, handleFulfilled)
      .addCase(addToCart.rejected, handleRejected)
      .addCase(removeFromCart.pending, handlePending)
      .addCase(removeFromCart.fulfilled, handleFulfilled)
      .addCase(removeFromCart.rejected, handleRejected)
      .addCase(deleteFromCart.pending, handlePending)
      .addCase(deleteFromCart.fulfilled, handleFulfilled)
      .addCase(deleteFromCart.rejected, handleRejected);
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
