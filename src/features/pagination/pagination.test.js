import { describe, it, expect } from 'vitest';
import paginationReducer, { loadMore, resetPagination } from './paginationSlice';

describe('pagination slice', () => {
  const initialState = {
    itemsToShow: 6,
  };

  it('should return the initial state on first run', () => {
    const result = paginationReducer(undefined, { type: 'unknown' });
    expect(result).toEqual(initialState);
  });

  it('should handle loadMore by incrementing itemsToShow by 6', () => {
    const action = loadMore();
    const state = paginationReducer(initialState, action);
    expect(state.itemsToShow).toBe(12);
  });

  it('should handle loadMore correctly from a non-initial state', () => {
    const currentState = { itemsToShow: 12 };
    const action = loadMore();
    const state = paginationReducer(currentState, action);
    expect(state.itemsToShow).toBe(18);
  });

  it('should handle resetPagination by setting itemsToShow back to 6', () => {
    const currentState = { itemsToShow: 24 };
    const action = resetPagination();
    const state = paginationReducer(currentState, action);
    expect(state.itemsToShow).toBe(6);
  });
});
