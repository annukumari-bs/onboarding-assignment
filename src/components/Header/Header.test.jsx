import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';

vi.mock('react-redux', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        useSelector: vi.fn(),
    };
});

vi.mock('../../utils/helper.js', () => ({
  truncateQuantity: (quantity) => (quantity > 99 ? '99+' : quantity),
}));

const { useSelector } = await import('react-redux');

const renderHeader = (mockState) => {
  useSelector.mockImplementation(callback => callback(mockState));

  const store = configureStore({ reducer: { cart: () => (mockState.cart || { items: [] }) } });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main navigation links correctly', () => {
    renderHeader({ cart: { items: [] } });

    expect(screen.getByRole('link', { name: /website/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /my orders/i })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('link', { name: /view shopping cart/i })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  });

  it('does not display the cart count badge when the cart is empty', () => {
    renderHeader({ cart: { items: [] } });

    const badge = screen.queryByText(/\d+/);
    expect(badge).not.toBeInTheDocument();
  });

  it('displays the correct unique item count when the cart has items', () => {
    const mockItems = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 3 },
    ];
    renderHeader({ cart: { items: mockItems } });

    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('truncates the cart count when it exceeds the limit', () => {
    const mockItems = Array.from({ length: 100 }, (_, i) => ({
      productId: i + 1,
      quantity: 1,
    }));
    
    renderHeader({ cart: { items: mockItems } });

    const badge = screen.getByText('99+');
    expect(badge).toBeInTheDocument();
  });

  it('handles an undefined or null cart state gracefully', () => {
    renderHeader({}); 

    expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();
    
    const badge = screen.queryByText(/\d+/);
    expect(badge).not.toBeInTheDocument();
  });
});
