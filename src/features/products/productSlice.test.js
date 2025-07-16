import { describe, it, expect, vi } from 'vitest';
import productReducer, { fetchProducts, fetchProductById } from './productSlice';

vi.mock('../../api/product/product.js');

describe('products slice', () => {
  const initialState = {
    all: [],
    currentProduct: null,
    status: 'idle',
    error: null,
  };

  it('should return the initial state on first run', () => {
    const result = productReducer(undefined, { type: 'unknown' });
    expect(result).toEqual(initialState);
  });

  describe('fetchProducts async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchProducts.pending.type };
      const state = productReducer(initialState, action);
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const mockProducts = [{ id: 1, title: 'Product 1' }, { id: 2, title: 'Product 2' }];
      const action = { type: fetchProducts.fulfilled.type, payload: mockProducts };
      const state = productReducer(initialState, action);
      expect(state.status).toBe('succeeded');
      expect(state.all).toEqual(mockProducts);
    });

    it('should handle rejected state', () => {
      const error = { message: 'Failed to fetch products' };
      const action = { type: fetchProducts.rejected.type, error };
      const state = productReducer(initialState, action);
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to fetch products');
    });
  });

  describe('fetchProductById async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchProductById.pending.type };
      const state = productReducer(initialState, action);
      expect(state.status).toBe('loading');
      expect(state.currentProduct).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const mockProduct = { id: 1, title: 'Specific Product' };
      const action = { type: fetchProductById.fulfilled.type, payload: mockProduct };
      const state = productReducer(initialState, action);
      expect(state.status).toBe('succeeded');
      expect(state.currentProduct).toEqual(mockProduct);
    });

    it('should handle rejected state', () => {
      const error = { message: 'Failed to fetch product by ID' };
      const action = { type: fetchProductById.rejected.type, payload: error.message }; // Thunks pass error message in payload on rejection
      const state = productReducer(initialState, action);
      expect(state.status).toBe('failed');
      expect(state.error).toBe(error.message);
    });
  });
});
