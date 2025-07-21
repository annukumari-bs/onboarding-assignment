import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartPage from './CartPage';
import { deleteFromCart } from '../../features/cart/cartSlice';

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

vi.mock('../../features/cart/cartSlice');

describe('CartPage', () => {
  const dispatch = vi.fn();

  const mockAllProducts = [
    { id: 'prod-1', title: 'Elegant Watch', price: 250, image: 'watch.jpg' },
    { id: 'prod-2', title: 'Wireless Mouse', price: 75, image: 'mouse.jpg' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    vi.mocked(deleteFromCart).mockClear();
  });

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  }

  describe('when cart is empty', () => {
    it('shows a loading message if status is loading and cart is empty', () => {
      useSelector.mockImplementation(callback => callback({
        cart: { items: [], status: 'loading' },
        products: { all: [] }
      }));
      
      renderWithRouter(<CartPage />);
      
      expect(screen.getByText('Loading Your Cart...')).toBeInTheDocument();
    });

    it('shows the "Your Cart is Empty" message and a link to continue shopping', () => {
      useSelector.mockImplementation(callback => callback({
        cart: { items: [], status: 'succeeded' },
        products: { all: mockAllProducts }
      }));
      
      renderWithRouter(<CartPage />);
      
      expect(screen.getByRole('heading', { name: 'Your Cart is Empty' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Continue Shopping' })).toBeInTheDocument();
    });
  });

  describe('when cart has items', () => {
    const mockCartItems = [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ];

    beforeEach(() => {
      useSelector.mockImplementation(callback => callback({
        cart: { items: mockCartItems, status: 'succeeded' },
        products: { all: mockAllProducts }
      }));
    });

    it('renders the cart items and order summary', () => {
      renderWithRouter(<CartPage />);
      
      expect(screen.getByText('Elegant Watch')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument();
    });

    it('calculates and displays the correct subtotal', () => {
      renderWithRouter(<CartPage />);
      
      const subtotalElements = screen.getAllByText('₹575.00');
      expect(subtotalElements.length).toBe(2);
    });

    it('allows typing in the coupon code field', async () => {
      renderWithRouter(<CartPage />);
      const user = userEvent.setup();
      const couponInput = screen.getByPlaceholderText('Enter coupon code here');
      
      await user.type(couponInput, 'SUMMER25');
      
      expect(couponInput).toHaveValue('SUMMER25');
    });

    it('dispatches deleteFromCart and shows a toast on remove button click', async () => {
      const user = userEvent.setup();
      const unwrap = vi.fn().mockResolvedValue({});
      dispatch.mockReturnValue({ unwrap });
      
      const mockedAction = vi.mocked(deleteFromCart);
      mockedAction.typePrefix = 'cart/deleteFromCart'; 
      mockedAction.mockReturnValue({ typePrefix: 'cart/deleteFromCart' });

      renderWithRouter(<CartPage />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove .* from cart/i });
      await user.click(removeButtons[0]);
      
      expect(dispatch).toHaveBeenCalled();
      expect(deleteFromCart).toHaveBeenCalledWith('prod-1');
      expect(toast.error).toHaveBeenCalledWith('Elegant Watch removed from cart.');
    });

    it('shows an error toast if deleting from cart fails', async () => {
        const user = userEvent.setup();
        const unwrap = vi.fn().mockRejectedValue(new Error('API Error'));
        dispatch.mockReturnValue({ unwrap });

        const mockedAction = vi.mocked(deleteFromCart);
        mockedAction.typePrefix = 'cart/deleteFromCart';
        mockedAction.mockReturnValue({ typePrefix: 'cart/deleteFromCart' });
  
        renderWithRouter(<CartPage />);
        
        const removeButtons = screen.getAllByRole('button', { name: /remove .* from cart/i });
        await user.click(removeButtons[0]);
  
        expect(toast.error).toHaveBeenCalledWith('Failed to update cart.', expect.any(Error));
      });
  });

  describe('Order Information Accordion', () => {
    beforeEach(() => {
        useSelector.mockImplementation(callback => callback({
          cart: { items: [{ productId: 'prod-1', quantity: 1 }], status: 'succeeded' },
          products: { all: mockAllProducts }
        }));
      });

    it('toggles accordion content on click', async () => {
        renderWithRouter(<CartPage />);
        const user = userEvent.setup();

        const returnPolicyButton = screen.getByRole('button', { name: /Return Policy/i });
        const shippingOptionsButton = screen.getByRole('button', { name: /Shipping Options/i });

        expect(screen.queryByText(/this is our example return policy/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/we offer various shipping options/i)).not.toBeInTheDocument();

        await user.click(returnPolicyButton);
        expect(await screen.findByText(/this is our example return policy/i)).toBeInTheDocument();
        expect(screen.queryByText(/we offer various shipping options/i)).not.toBeInTheDocument();

        await user.click(shippingOptionsButton);
        expect(await screen.findByText(/we offer various shipping options/i)).toBeInTheDocument();
        expect(screen.getByText(/this is our example return policy/i)).toBeInTheDocument();

        await user.click(returnPolicyButton);
        expect(screen.queryByText(/this is our example return policy/i)).not.toBeInTheDocument();
        expect(screen.getByText(/we offer various shipping options/i)).toBeInTheDocument();
    });
  });
});
