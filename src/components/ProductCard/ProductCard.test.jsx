import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

// Mock the constants file since it's an external dependency
vi.mock('../../constants', () => ({
  FALLBACK_IMAGES: [
    'fallback1.jpg',
    'fallback2.jpg',
  ],
}));

// Helper function to render the component within a router context
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

    // Check for the title
    expect(screen.getByText('Classic Leather Jacket')).toBeInTheDocument();
    
    // Check for the formatted price
    expect(screen.getByText('₹199.99')).toBeInTheDocument();
    
    // Check for the formatted rating
    expect(screen.getByText('Rating: 4.8 ★')).toBeInTheDocument();
    
    // Check if the image is rendered with the correct alt text and src
    const image = screen.getByRole('img', { name: /classic leather jacket/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'jacket.jpg');
  });

  it('renders with default props if none are provided', () => {
    // Render the component without any props (it should use defaults)
    renderProductCard({ id: 2 }); // ID is required for the link

    expect(screen.getByText('Untitled Product')).toBeInTheDocument();
    expect(screen.getByText('₹0.00')).toBeInTheDocument();
    expect(screen.getByText('Rating: 0.0 ★')).toBeInTheDocument();
  });

  it('navigates to the correct product detail page on click', () => {
    renderProductCard(mockProduct);
    
    // The entire card is a link, so we can check its href
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('shows a fallback image when the primary image fails to load', () => {
    renderProductCard(mockProduct);

    const image = screen.getByRole('img');
    
    // Simulate an error event on the image
    fireEvent.error(image);

    // Check if the image src has been updated to the fallback image
    // The fallback is chosen by id % FALLBACK_IMAGES.length (1 % 2 = 1)
    expect(image).toHaveAttribute('src', 'fallback2.jpg');
  });
});
