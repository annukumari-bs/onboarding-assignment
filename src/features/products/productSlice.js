import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllProducts, fetchProductById as fetchProductByIdAPI } from '../../api/product/product';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetchAllProducts();
    return response.products;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetchProductByIdAPI(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    all: [],
    currentProduct: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.all = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
        state.currentProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
