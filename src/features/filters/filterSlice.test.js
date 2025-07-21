import { describe, it, expect } from 'vitest';
import filterReducer, {
  setCategory,
  setPrice,
  setRating,
  setSort,
  clearFilters,
} from './filterSlice';

describe('filters slice', () => {
  const initialState = {
    selectedCategories: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: { key: 'price', direction: 'desc' },
  };

  it('should return the initial state on first run', () => {
    const result = filterReducer(undefined, { type: 'unknown' });
    expect(result).toEqual(initialState);
  });

  describe('setCategory reducer', () => {
    it('should add a category if it does not exist', () => {
      const action = setCategory('electronics');
      const state = filterReducer(initialState, action);
      expect(state.selectedCategories).toEqual(['electronics']);
    });

    it('should remove a category if it already exists', () => {
      const currentState = { ...initialState, selectedCategories: ['electronics', 'laptops'] };
      const action = setCategory('electronics');
      const state = filterReducer(currentState, action);
      expect(state.selectedCategories).toEqual(['laptops']);
    });
  });

  it('should handle setPrice', () => {
    const action = setPrice({ min: '100', max: '500' });
    const state = filterReducer(initialState, action);
    expect(state.minPrice).toBe('100');
    expect(state.maxPrice).toBe('500');
  });

  it('should handle setRating', () => {
    const action = setRating('4');
    const state = filterReducer(initialState, action);
    expect(state.minRating).toBe('4');
  });

  it('should handle setSort', () => {
    const newSortConfig = { key: 'rating', direction: 'asc' };
    const action = setSort(newSortConfig);
    const state = filterReducer(initialState, action);
    expect(state.sort).toEqual(newSortConfig);
  });

  it('should handle clearFilters', () => {
    const currentState = {
      selectedCategories: ['laptops'],
      minPrice: '50',
      maxPrice: '1000',
      minRating: '3',
      sort: { key: 'price', direction: 'asc' },
    };
    const action = clearFilters();
    const state = filterReducer(currentState, action);
    expect(state).toEqual({
      selectedCategories: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: { key: 'rating', direction: 'desc' },
    });
  });
});
