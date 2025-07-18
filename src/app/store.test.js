import { describe, it, expect } from 'vitest';
import { store } from './store'; // Adjust the import path as needed

// Import the individual reducers to get their initial states
import productsReducer from '../features/products/productSlice';
import filtersReducer from '../features/filters/filterSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from '../features/orders/orderSlice';

describe('Redux Store', () => {

  it('should be configured with the correct reducers and initial state', () => {
    // Get the actual initial state from the configured store
    const actualInitialState = store.getState();

    // Determine the expected initial state by combining the initial states of each reducer
    const expectedInitialState = {
      products: productsReducer(undefined, { type: 'unknown' }),
      filters: filtersReducer(undefined, { type: 'unknown' }),
      pagination: paginationReducer(undefined, { type: 'unknown' }),
      cart: cartReducer(undefined, { type: 'unknown' }),
      orders: ordersReducer(undefined, { type: 'unknown' }),
    };

    // Assert that the store's initial state matches the combined initial states
    expect(actualInitialState).toEqual(expectedInitialState);
  });

  it('should have the correct keys in the root state object', () => {
    const state = store.getState();
    const stateKeys = Object.keys(state);

    // Assert that all expected reducer keys are present in the store's state
    expect(stateKeys).toContain('products');
    expect(stateKeys).toContain('filters');
    expect(stateKeys).toContain('pagination');
    expect(stateKeys).toContain('cart');
    expect(stateKeys).toContain('orders');
  });

});
