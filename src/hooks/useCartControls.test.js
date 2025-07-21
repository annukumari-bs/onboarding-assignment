import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useCartControls } from './useCartControls';
import { addToCart, removeFromCart } from '../features/cart/cartSlice'

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../features/cart/cartSlice');

describe('useCartControls', () => {
  const dispatch = vi.fn();
  const mockProductId = 'prod-1';
  const mockProductTitle = 'Test Product';

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    vi.mocked(addToCart).mockClear();
    vi.mocked(removeFromCart).mockClear();
  });

  describe('Initial State', () => {
    it('should return quantity 0 when item is not in cart', () => {
      useSelector.mockImplementation(callback => callback({ cart: { items: [] } }));

      const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));

      expect(result.current.quantityInCart).toBe(0);
    });

    it('should return the correct quantity when item is in cart', () => {
      const mockCartItem = { productId: mockProductId, quantity: 3 };
      useSelector.mockImplementation(callback => callback({ cart: { items: [mockCartItem] } }));

      const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));

      expect(result.current.quantityInCart).toBe(3);
    });
  });

  describe('handleIncrement', () => {
    it('should dispatch addToCart and show success toast on first add', async () => {
      useSelector.mockImplementation(callback => callback({ cart: { items: [] } }));
      const unwrap = vi.fn().mockResolvedValue({});
      dispatch.mockReturnValue({ unwrap });
      vi.mocked(addToCart).mockReturnValue({});

      const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));

      await act(async () => {
        result.current.handleIncrement();
      });

      expect(dispatch).toHaveBeenCalled();
      expect(addToCart).toHaveBeenCalledWith({ productId: mockProductId, quantity: 1 });
      expect(toast.success).toHaveBeenCalledWith('Test Product added to cart!');
      expect(result.current.status).toBe('idle');
    });

    it('should dispatch addToCart and show update toast when item is already in cart', async () => {
      const mockCartItem = { productId: mockProductId, quantity: 2 };
      useSelector.mockImplementation(callback => callback({ cart: { items: [mockCartItem] } }));
      const unwrap = vi.fn().mockResolvedValue({});
      dispatch.mockReturnValue({ unwrap });
      vi.mocked(addToCart).mockReturnValue({});

      const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));

      await act(async () => {
        result.current.handleIncrement();
      });

      expect(dispatch).toHaveBeenCalled();
      expect(addToCart).toHaveBeenCalledWith({ productId: mockProductId, quantity: 3 });
      expect(toast.success).toHaveBeenCalledWith('Quantity updated!');
    });

    it('should show an error toast if addToCart fails', async () => {
        useSelector.mockImplementation(callback => callback({ cart: { items: [] } }));
        const unwrap = vi.fn().mockRejectedValue(new Error('API Error'));
        dispatch.mockReturnValue({ unwrap });
        vi.mocked(addToCart).mockReturnValue({});
  
        const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));
  
        await act(async () => {
          result.current.handleIncrement();
        });
  
        expect(toast.error).toHaveBeenCalledWith('Failed to update cart.');
        expect(result.current.status).toBe('idle');
      });
  });

  describe('handleDecrement', () => {
    it('should dispatch removeFromCart and show info toast', async () => {
      const unwrap = vi.fn().mockResolvedValue({});
      dispatch.mockReturnValue({ unwrap });
      vi.mocked(removeFromCart).mockReturnValue({});

      const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));

      await act(async () => {
        result.current.handleDecrement();
      });

      expect(dispatch).toHaveBeenCalled();
      expect(removeFromCart).toHaveBeenCalledWith(mockProductId);
      expect(toast.info).toHaveBeenCalledWith('Item quantity updated.');
      expect(result.current.status).toBe('idle');
    });

    it('should show an error toast if removeFromCart fails', async () => {
        const unwrap = vi.fn().mockRejectedValue(new Error('API Error'));
        dispatch.mockReturnValue({ unwrap });
        vi.mocked(removeFromCart).mockReturnValue({});
  
        const { result } = renderHook(() => useCartControls(mockProductId, mockProductTitle));
  
        await act(async () => {
          result.current.handleDecrement();
        });
  
        expect(toast.error).toHaveBeenCalledWith('Failed to update cart.');
        expect(result.current.status).toBe('idle');
      });
  });
});
