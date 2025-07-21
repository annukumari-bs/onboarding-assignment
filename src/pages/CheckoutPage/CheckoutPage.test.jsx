import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutPage from './CheckoutPage';
import { placeOrder } from '../../features/orders/orderSlice';
import { clearCart, deleteFromCart } from '../../features/cart/cartSlice'; 

const mockNavigate = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../../features/orders/orderSlice');
vi.mock('../../features/cart/cartSlice');

describe('CheckoutPage', () => {
  const dispatch = vi.fn();

  const mockCartItems = [
    { productId: 'prod-1', quantity: 2 },
    { productId: 'prod-2', quantity: 1 },
  ];
  const mockAllProducts = [
    { id: 'prod-1', title: 'Laptop', price: 1000, image: 'laptop.jpg' },
    { id: 'prod-2', title: 'Mouse', price: 25, image: 'mouse.jpg' },
  ];

  const mockState = {
    cart: { items: mockCartItems },
    products: { all: mockAllProducts },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation(callback => callback(mockState));
    vi.mocked(placeOrder).mockClear();
    vi.mocked(clearCart).mockClear();
    vi.mocked(deleteFromCart).mockClear();
  });

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  }

  describe('Address Step', () => {
    it('renders the address form initially', () => {
      renderWithRouter(<CheckoutPage />);
      expect(screen.getByRole('heading', { name: /Shipping Information/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty address fields on submit', async () => {
      renderWithRouter(<CheckoutPage />);
      const user = userEvent.setup();
      
      await user.clear(screen.getByPlaceholderText('First Name'));
      await user.clear(screen.getByPlaceholderText('Last Name'));
      
      await user.click(screen.getByRole('button', { name: /Continue to Payment/i }));

      expect(await screen.findByText('First name is required.')).toBeInTheDocument();
      expect(screen.getByText('Last name is required.')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Payment Details/i })).not.toBeInTheDocument();
    });

    it('transitions to the payment step with valid address data', async () => {
      renderWithRouter(<CheckoutPage />);
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('button', { name: /Continue to Payment/i }));

      expect(await screen.findByRole('heading', { name: /Payment Details/i })).toBeInTheDocument();
    });
  });

  describe('Payment Step', () => {
    beforeEach(async () => {
        renderWithRouter(<CheckoutPage />);
        await userEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));
        await screen.findByRole('heading', { name: /Payment Details/i });
    });

    it('shows validation errors for invalid payment fields', async () => {
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /Pay with card/i }));

        expect(await screen.findByText('Cardholder name is required.')).toBeInTheDocument();
        expect(screen.getByText('Must be a 16-digit card number.')).toBeInTheDocument();
    });

    it('dispatches placeOrder and clearCart on successful payment', async () => {
        const user = userEvent.setup();
        const unwrap = vi.fn().mockResolvedValue({});
        dispatch.mockReturnValue({ unwrap });
        vi.mocked(placeOrder).mockReturnValue({});

        await user.type(screen.getByPlaceholderText('Cardholder Name'), 'Jane Doe');
        await user.type(screen.getByPlaceholderText('Card Number'), '1111222233334444');
        await user.type(screen.getByPlaceholderText('Month (MM)'), '12');
        await user.type(screen.getByPlaceholderText('Year (YY)'), '28');
        await user.type(screen.getByPlaceholderText('CVC'), '123');
        
        await user.click(screen.getByRole('button', { name: /Pay with card/i }));

        expect(placeOrder).toHaveBeenCalled();
        expect(clearCart).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Order placed successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });

    it('shows an error toast if placeOrder fails', async () => {
        const user = userEvent.setup();
        const unwrap = vi.fn().mockRejectedValue(new Error('Order failed'));
        dispatch.mockReturnValue({ unwrap });
        vi.mocked(placeOrder).mockReturnValue({});

        await user.type(screen.getByPlaceholderText('Cardholder Name'), 'Jane Doe');
        await user.type(screen.getByPlaceholderText('Card Number'), '1111222233334444');
        await user.type(screen.getByPlaceholderText('Month (MM)'), '12');
        await user.type(screen.getByPlaceholderText('Year (YY)'), '28');
        await user.type(screen.getByPlaceholderText('CVC'), '123');

        await user.click(screen.getByRole('button', { name: /Pay with card/i }));

        expect(toast.error).toHaveBeenCalledWith('Failed to place order.');
        expect(clearCart).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('CheckoutCartSummary', () => {
    it('renders cart items and calculates subtotal correctly', () => {
        renderWithRouter(<CheckoutPage />);
        
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();

        expect(screen.getAllByText('₹2025.00')).toHaveLength(2);
    });

    it('dispatches deleteFromCart when remove button is clicked', async () => {
        const user = userEvent.setup();
        const unwrap = vi.fn().mockResolvedValue({});
        dispatch.mockReturnValue({ unwrap });
        vi.mocked(deleteFromCart).mockReturnValue({});

        renderWithRouter(<CheckoutPage />);
        
        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        await user.click(removeButtons[0]);

        expect(deleteFromCart).toHaveBeenCalledWith('prod-1');
        expect(toast.error).toHaveBeenCalledWith('Laptop removed from cart.');
    });
  });
});
