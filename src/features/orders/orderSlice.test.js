import { describe, it, expect, vi } from 'vitest';
import ordersReducer, { fetchOrders, placeOrder } from './orderSlice';

vi.mock('../../api/orders/orders');

describe('ordersSlice', () => {
  const initialState = {
    orders: [],
    status: 'idle',
    error: null,
  };

  it('should return the initial state', () => {
    expect(ordersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchOrders async thunk', () => {
    const mockOrders = [{ id: 1, total: 100 }, { id: 2, total: 150 }];
    
    it('should handle fetchOrders.pending', () => {
      const action = { type: fetchOrders.pending.type };
      const state = ordersReducer(initialState, action);
      expect(state.status).toBe('loading');
    });

    it('should handle fetchOrders.fulfilled', () => {
      const action = { type: fetchOrders.fulfilled.type, payload: mockOrders };
      const state = ordersReducer(initialState, action);
      expect(state.status).toBe('succeeded');
      expect(state.orders).toEqual(mockOrders);
    });

    it('should handle fetchOrders.rejected', () => {
      const errorMessage = 'Failed to fetch';
      const action = { type: fetchOrders.rejected.type, payload: errorMessage };
      const state = ordersReducer(initialState, action);
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('placeOrder async thunk', () => {
    const mockNewOrder = { id: 3, userId: 550, products: [] };
    const existingState = {
        ...initialState,
        orders: [{ id: 1, total: 100 }, { id: 2, total: 150 }],
    };

    it('should handle placeOrder.pending', () => {
      const action = { type: placeOrder.pending.type };
      const state = ordersReducer(existingState, action);
      expect(state.status).toBe('loading');
    });

    it('should handle placeOrder.fulfilled and add the new order to the top', () => {
      const action = { type: placeOrder.fulfilled.type, payload: mockNewOrder };
      const state = ordersReducer(existingState, action);
      expect(state.status).toBe('succeeded');
      expect(state.orders[0]).toEqual(mockNewOrder);
      expect(state.orders.length).toBe(3);
    });

    it('should handle placeOrder.rejected', () => {
      const errorMessage = 'Failed to place order';
      const action = { type: placeOrder.rejected.type, payload: errorMessage };
      const state = ordersReducer(existingState, action);
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });
  });
});
