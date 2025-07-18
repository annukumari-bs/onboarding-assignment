import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

vi.mock('../../constants', () => ({
  FALLBACK_IMAGES: [
    'fallback1.jpg',
    'fallback2.jpg',
  ],
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
    title: 'Classic Leather Jacket',
    price: 199.99,
    image: 'jacket.jpg',
    rating: 4.8,
  };

  it('renders product details correctly with given props', () => {
    renderProductCard(mockProduct);

    expect(screen.getByText('Classic Leather Jacket')).toBeInTheDocument();
    
    expect(screen.getByText('₹199.99')).toBeInTheDocument();
    
    expect(screen.getByText('Rating: 4.8 ★')).toBeInTheDocument();
    
    const image = screen.getByRole('img', { name: /classic leather jacket/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'jacket.jpg');
  });

  it('renders with default props if none are provided', () => {
    renderProductCard({ id: 2 });

    expect(screen.getByText('Untitled Product')).toBeInTheDocument();
    expect(screen.getByText('₹0.00')).toBeInTheDocument();
    expect(screen.getByText('Rating: 0.0 ★')).toBeInTheDocument();
  });

  it('navigates to the correct product detail page on click', () => {
    renderProductCard(mockProduct);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('shows a fallback image when the primary image fails to load', () => {
    renderProductCard(mockProduct);

    const image = screen.getByRole('img');
    
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', 'fallback2.jpg');
  });
});
