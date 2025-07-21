import { describe, it, expect, vi, beforeEach } from 'vitest';
import cartReducer, {
  fetchCart,
  addToCart,
  removeFromCart,
  deleteFromCart,
} from './cartSlice';

vi.mock('../../api/cart/cart.js', () => ({
  getCartItems: vi.fn(),
  postToCart: vi.fn(),
  updateCartItem: vi.fn(),
  deleteCartItem: vi.fn(),
}));

describe('cart slice', () => {
  const initialState = {
    items: [],
    status: 'idle',
    error: null,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return the initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchCart thunk', () => {
    it('should handle fulfilled state', () => {
      const mockCart = [{ productId: 1, quantity: 2 }];
      const action = fetchCart.fulfilled(mockCart);
      const state = cartReducer(initialState, action);
      expect(state.status).toBe('succeeded');
      expect(state.items).toEqual(mockCart);
    });
  });

  describe('addToCart thunk', () => {
    it('should add a new item to the cart', () => {
      const newItem = { productId: 2, quantity: 1 };
      const action = addToCart.fulfilled(newItem);
      const state = cartReducer(initialState, action);
      expect(state.items).toContainEqual(newItem);
    });

    it('should increment an existing item in the cart', () => {
      const currentState = {
        ...initialState,
        items: [{ productId: 1, quantity: 2 }],
      };
      const updatedItem = { productId: 1, quantity: 3 };
      const action = addToCart.fulfilled(updatedItem);
      const state = cartReducer(currentState, action);
      expect(state.items[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart thunk', () => {
    it('should decrement an item quantity if more than 1', () => {
      const currentState = {
        ...initialState,
        items: [{ productId: 1, quantity: 3 }],
      };
      const updatedItem = { productId: 1, quantity: 2 };
      const action = removeFromCart.fulfilled(updatedItem);
      const state = cartReducer(currentState, action);
      expect(state.items[0].quantity).toBe(2);
    });

    it('should remove an item if quantity becomes 0', () => {
      const currentState = {
        ...initialState,
        items: [{ productId: 1, quantity: 1 }],
      };
      const actionPayload = { productId: 1, removed: true };
      const action = removeFromCart.fulfilled(actionPayload);
      const state = cartReducer(currentState, action);
      expect(state.items).toEqual([]);
    });
  });

  describe('deleteFromCart thunk', () => {
    it('should remove an item completely from the cart', () => {
        const currentState = {
            ...initialState,
            items: [{ productId: 1, quantity: 5 }, { productId: 2, quantity: 1 }],
        };
        const actionPayload = { productId: 1, removed: true };
        const action = deleteFromCart.fulfilled(actionPayload);
        const state = cartReducer(currentState, action);
        expect(state.items.length).toBe(1);
        expect(state.items[0].productId).toBe(2);
    });
  });

  describe('pending and rejected states', () => {
    it('should set status to loading on pending', () => {
        const action = { type: addToCart.pending.type };
        const state = cartReducer(initialState, action);
        expect(state.status).toBe('loading');
    });

    it('should set status to failed on rejected', () => {
        const action = { type: addToCart.rejected.type, payload: 'API Error' };
        const state = cartReducer(initialState, action);
        expect(state.status).toBe('failed');
        expect(state.error).toBe('API Error');
    });
  });
});
