import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProductDetailPage from './ProductDetailPage';

import productReducer from '../../features/products/productSlice';
import cartReducer from '../../features/cart/cartSlice';
import wishlistReducer, { toggleWishlist } from '../../features/wishlist/wishlistSlice';

vi.mock('../../hooks/useCartControls', () => ({ useCartControls: vi.fn() }));
vi.mock('../../features/products/productSlice', async (orig) => {
    const original = await orig();
    return {
        ...original,
        fetchProductById: vi.fn((id) => ({ type: 'products/fetchProductById/mocked', payload: id })),
    };
});
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), info: vi.fn() } }));
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

import { useCartControls } from '../../hooks/useCartControls';
import { toast } from 'react-toastify';
import { fetchProductById } from '../../features/products/productSlice';


const renderPDP = (preloadedState, initialRoute = '/product/1') => {
  const store = configureStore({
    reducer: {
      products: productReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
    },
    preloadedState,
  });
  
  vi.spyOn(store, 'dispatch');

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe('ProductDetailPage with Wishlist', () => {
    const mockProduct = {
        id: 1,
        title: 'Iconic Watch',
        price: 2500,
        description: 'A truly iconic watch.',
        image: 'iconic-watch.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useCartControls.mockReturnValue({
            quantityInCart: 0,
            handleIncrement: vi.fn(),
            handleDecrement: vi.fn(),
            status: 'idle',
        });
    });

    it('dispatches fetchProductById on mount', () => {
        const { store } = renderPDP({
            products: { currentProduct: null, status: 'idle' },
            wishlist: { items: [] }
        }, '/product/5');
        
        expect(store.dispatch).toHaveBeenCalledWith(fetchProductById('5'));
    });

    it('renders wishlist and share icons', () => {
        renderPDP({ products: { currentProduct: mockProduct, status: 'succeeded' } });
        expect(screen.getByRole('button', { name: /add to wishlist/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /share product/i })).toBeInTheDocument();
    });

    it('dispatches toggleWishlist action when wishlist icon is clicked', () => {
        const { store } = renderPDP({
            products: { currentProduct: mockProduct, status: 'succeeded' },
            wishlist: { items: [] }
        });

        const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
        fireEvent.click(wishlistButton);
        expect(store.dispatch).toHaveBeenCalledWith(toggleWishlist(mockProduct.id));
        expect(toast.success).toHaveBeenCalledWith('Added to wishlist!');
    });

    it('calls clipboard API when share icon is clicked', () => {
        renderPDP({ products: { currentProduct: mockProduct, status: 'succeeded' } });
        
        const shareButton = screen.getByRole('button', { name: /share product/i });
        fireEvent.click(shareButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(toast.info).toHaveBeenCalledWith('Product link copied to clipboard!');
    });
});
