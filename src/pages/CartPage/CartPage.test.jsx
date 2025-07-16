import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CartPage from './CartPage';

// Import reducers to create a real store for testing
import productReducer from '../../features/products/productSlice';
import cartReducer from '../../features/cart/cartSlice';

// Mock dependencies
vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../features/cart/cartSlice', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        deleteFromCart: vi.fn(),
    };
});

import { addToCart, removeFromCart, deleteFromCart } from '../../features/cart/cartSlice';

const mockProducts = [
    { id: 1, title: 'Test Product 1', price: 100, image: 'img1.jpg' },
    { id: 2, title: 'Test Product 2', price: 50, image: 'img2.jpg' },
];

const mockCartItems = [
    { _id: 'cart1', productId: 1, quantity: 2 },
    { _id: 'cart2', productId: 2, quantity: 1 },
];

const renderCartPage = (preloadedState) => {
    const store = configureStore({
        reducer: {
            products: productReducer,
            cart: cartReducer,
        },
        preloadedState,
    });

    // Mock the thunks to return a resolved promise with unwrap
    const mockThunk = () => ({ unwrap: () => Promise.resolve() });
    addToCart.mockImplementation(mockThunk);
    removeFromCart.mockImplementation(mockThunk);
    deleteFromCart.mockImplementation(mockThunk);

    return render(
        <Provider store={store}>
            <BrowserRouter>
                <CartPage />
            </BrowserRouter>
        </Provider>
    );
};

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows "Cart is Empty" message when there are no items', () => {
        renderCartPage({ cart: { items: [], status: 'succeeded' }, products: { all: [] } });
        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
    });

    it('renders cart items and order summary correctly', () => {
        renderCartPage({ cart: { items: mockCartItems, status: 'succeeded' }, products: { all: mockProducts } });
        
        // Check if items are rendered
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        
        // Check quantities
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        // FIX: Use getAllByText and assert the length because the subtotal and total are the same.
        // Check for subtotal (100*2 + 50*1 = 250)
        const priceElements = screen.getAllByText('₹250.00');
        expect(priceElements).toHaveLength(2);
    });

    it('calls addToCart when "+" button is clicked', () => {
        renderCartPage({ cart: { items: mockCartItems, status: 'succeeded' }, products: { all: mockProducts } });

        const incrementButtons = screen.getAllByRole('button', { name: '+' });
        fireEvent.click(incrementButtons[0]); // Click the first increment button

        expect(addToCart).toHaveBeenCalledWith(1); // Product ID of the first item
    });

    it('calls removeFromCart when "-" button is clicked', () => {
        renderCartPage({ cart: { items: mockCartItems, status: 'succeeded' }, products: { all: mockProducts } });

        const decrementButtons = screen.getAllByRole('button', { name: '-' });
        fireEvent.click(decrementButtons[0]); // Click the first decrement button

        expect(removeFromCart).toHaveBeenCalledWith(1);
    });

    it('calls deleteFromCart when "Remove" button is clicked', () => {
        renderCartPage({ cart: { items: mockCartItems, status: 'succeeded' }, products: { all: mockProducts } });

        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[0]); // Click the first remove button

        expect(deleteFromCart).toHaveBeenCalledWith(1);
    });

    it('opens and closes the accordion items', () => {
        renderCartPage({ cart: { items: mockCartItems, status: 'succeeded' }, products: { all: mockProducts } });

        const returnPolicyButton = screen.getByRole('button', { name: /return policy/i });
        expect(screen.queryByText(/this is our example return policy/i)).not.toBeInTheDocument();

        // Open accordion
        fireEvent.click(returnPolicyButton);
        expect(screen.getByText(/this is our example return policy/i)).toBeInTheDocument();

        // Close accordion
        fireEvent.click(returnPolicyButton);
        expect(screen.queryByText(/this is our example return policy/i)).not.toBeInTheDocument();
    });
});
