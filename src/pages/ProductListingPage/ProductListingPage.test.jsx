import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProductListingPage from './ProductListingPage';

import productReducer from '../../features/products/productSlice';
import filterReducer from '../../features/filters/filterSlice';
import paginationReducer from '../../features/pagination/paginationSlice';
import cartReducer from '../../features/cart/cartSlice';

vi.mock('../../features/products/productSlice.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchProducts: () => ({ type: 'products/fetchProducts/fulfilled', payload: mockProducts }),
  };
});

const mockProducts = [
  { id: 1, title: 'Laptop', price: 1200, category: 'laptops', rating: 4.5 },
  { id: 2, title: 'Phone', price: 800, category: 'smartphones', rating: 4.8 },
];

const renderPLP = (preloadedState) => {
  const store = configureStore({
    reducer: {
      products: productReducer,
      filters: filterReducer,
      pagination: paginationReducer,
      cart: cartReducer,
    },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <BrowserRouter><ProductListingPage /></BrowserRouter>
    </Provider>
  );
};

describe('ProductListingPage', () => {
  it('displays loading state and then shows products', () => {
    const { rerender } = renderPLP({ products: { all: [], status: 'loading' } });
    expect(screen.getByText(/loading products.../i)).toBeInTheDocument();

    const store = configureStore({
        reducer: { products: productReducer, filters: filterReducer, pagination: paginationReducer, cart: cartReducer },
        preloadedState: { products: { all: mockProducts, status: 'succeeded' } }
    });

    rerender(
        <Provider store={store}>
            <BrowserRouter><ProductListingPage /></BrowserRouter>
        </Provider>
    );
    
    expect(screen.queryByText(/loading products.../i)).not.toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('filters products when a category is selected', () => {
    renderPLP({ products: { all: mockProducts, status: 'succeeded' } });

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    
    const smartphoneCheckbox = screen.getByRole('checkbox', { name: /smartphones/i });
    fireEvent.click(smartphoneCheckbox);

    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });
});
