import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useCartControls } from '../../hooks/useCartControls';

vi.mock('../../hooks/useCartControls', () => ({
  useCartControls: vi.fn(),
}));

vi.mock('../../utils/formatters.js', () => ({
  truncateQuantity: (quantity) => quantity > 999 ? '999+' : quantity,
}));

const renderProductCard = (props) => {
  return render(
    <BrowserRouter>
      <ProductCard {...props} />
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    title: 'Awesome T-Shirt',
    price: 599,
    image: 't-shirt.jpg',
    rating: 4.7,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product details correctly', () => {
    useCartControls.mockReturnValue({
      quantityInCart: 0,
      handleIncrement: vi.fn(),
      handleDecrement: vi.fn(),
      status: 'idle',
    });

    renderProductCard(mockProduct);

    expect(screen.getByText('Awesome T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Rating: 4.7 ★')).toBeInTheDocument();
    expect(screen.getByText('₹599.00')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /awesome t-shirt/i })).toBeInTheDocument();
  });

  it('shows "Add to Cart" button when quantity is 0', () => {
    useCartControls.mockReturnValue({
      quantityInCart: 0,
      handleIncrement: vi.fn(),
      handleDecrement: vi.fn(),
      status: 'idle',
    });

    renderProductCard(mockProduct);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('shows quantity controls when quantity is greater than 0', () => {
    useCartControls.mockReturnValue({
      quantityInCart: 3,
      handleIncrement: vi.fn(),
      handleDecrement: vi.fn(),
      status: 'idle',
    });

    renderProductCard(mockProduct);
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('calls handleIncrement when "Add to Cart" or "+" button is clicked', () => {
    const handleIncrementMock = vi.fn();
    useCartControls.mockReturnValue({
      quantityInCart: 0,
      handleIncrement: handleIncrementMock,
      handleDecrement: vi.fn(),
      status: 'idle',
    });

    renderProductCard(mockProduct);
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    expect(handleIncrementMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleDecrement when "-" button is clicked', () => {
    const handleDecrementMock = vi.fn();
    useCartControls.mockReturnValue({
      quantityInCart: 2,
      handleIncrement: vi.fn(),
      handleDecrement: handleDecrementMock,
      status: 'idle',
    });

    renderProductCard(mockProduct);
    const decrementButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(decrementButton);

    expect(handleDecrementMock).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when status is "loading"', () => {
    useCartControls.mockReturnValue({
      quantityInCart: 1,
      handleIncrement: vi.fn(),
      handleDecrement: vi.fn(),
      status: 'loading',
    });

    renderProductCard(mockProduct);
    expect(screen.getByRole('button', { name: '-' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '+' })).toBeDisabled();
  });
});
