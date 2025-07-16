import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useCartControls } from './useCartControls';
import { addToCart, removeFromCart } from '../features/cart/cartSlice';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../features/cart/cartSlice', () => ({
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
}));

describe('useCartControls', () => {
  const mockDispatch = vi.fn();
  const productId = 1;
  const productTitle = 'Test Product';

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  it('should return quantity 0 when item is not in cart', () => {
    useSelector.mockReturnValue(undefined);

    const { result } = renderHook(() => useCartControls(productId, productTitle));

    expect(result.current.quantityInCart).toBe(0);
    expect(result.current.status).toBe('idle');
  });

  it('should return the correct quantity when item is in cart', () => {
    const mockCartItem = { productId: 1, quantity: 5 };
    useSelector.mockReturnValue(mockCartItem);

    const { result } = renderHook(() => useCartControls(productId, productTitle));

    expect(result.current.quantityInCart).toBe(5);
  });

  it('should dispatch addToCart and show success toast on handleIncrement', async () => {
    const unwrap = vi.fn(() => Promise.resolve());
    mockDispatch.mockReturnValue({ unwrap });
    
    useSelector.mockReturnValue(undefined);
    const { result } = renderHook(() => useCartControls(productId, productTitle));

    await act(async () => {
      result.current.handleIncrement();
    });

    expect(mockDispatch).toHaveBeenCalledWith(addToCart(productId));
    expect(toast.success).toHaveBeenCalledWith(`${productTitle} added to cart!`);
    expect(result.current.status).toBe('idle');
  });

  it('should dispatch removeFromCart and show info toast on handleDecrement', async () => {
    const unwrap = vi.fn(() => Promise.resolve());
    mockDispatch.mockReturnValue({ unwrap });

    const mockCartItem = { productId: 1, quantity: 5 };
    useSelector.mockReturnValue(mockCartItem);
    const { result } = renderHook(() => useCartControls(productId, productTitle));

    await act(async () => {
      result.current.handleDecrement();
    });

    expect(mockDispatch).toHaveBeenCalledWith(removeFromCart(productId));
    expect(toast.info).toHaveBeenCalledWith('Item quantity updated.');
    expect(result.current.status).toBe('idle');
  });

  it('should handle API failure gracefully and show an error toast', async () => {
    const unwrap = vi.fn(() => Promise.reject(new Error('API Error')));
    mockDispatch.mockReturnValue({ unwrap });

    useSelector.mockReturnValue(undefined);
    const { result } = renderHook(() => useCartControls(productId, productTitle));

    await act(async () => {
      result.current.handleIncrement();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to update cart.');
    expect(result.current.status).toBe('idle');
  });
});
