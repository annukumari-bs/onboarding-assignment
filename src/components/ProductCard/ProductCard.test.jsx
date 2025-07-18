import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard'; // Adjust the import path as needed

// Mock the local image asset to prevent errors in the test environment.
// Vitest will replace the import with this path.
vi.mock('../../assets/product.png', () => ({
  default: 'mock-fallback-product-image.png',
}));

// Helper function to wrap the component in a router for testing the <Link>
const renderProductCard = (props) => {
  return render(
    <BrowserRouter>
      <ProductCard {...props} />
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  const mockProduct = {
    id: 'prod-123',
    title: 'Modern Wireless Keyboard',
    price: 4500.50,
    image: 'http://example.com/keyboard.jpg',
  };

  it('should render all product details correctly', () => {
    renderProductCard(mockProduct);

    // Check for the title
    expect(screen.getByText('Modern Wireless Keyboard')).toBeInTheDocument();
    
    // Check for the correctly formatted price
    expect(screen.getByText('₹4500.50')).toBeInTheDocument();
  });

  it('should render a link that points to the correct product detail page', () => {
    renderProductCard(mockProduct);

    // The entire card should be a link
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/product/prod-123');
  });

  it('should render the product image with the correct src and alt attributes', () => {
    renderProductCard(mockProduct);
    const imageElement = screen.getByRole('img');

    expect(imageElement).toHaveAttribute('src', 'http://example.com/keyboard.jpg');
    expect(imageElement).toHaveAttribute('alt', 'Modern Wireless Keyboard');
  });

  it('should update the image src to the local fallback image on error', () => {
    renderProductCard(mockProduct);
    const imageElement = screen.getByRole('img');

    // Simulate the browser's `onerror` event for the image
    fireEvent.error(imageElement);

    // Assert that the image source has been changed to the mocked fallback path
    expect(imageElement).toHaveAttribute('src', 'mock-fallback-product-image.png');
  });

  it('should render with default props if none are provided', () => {
    // We must provide an `id` as it's used in the `key` and `Link` `to` prop.
    renderProductCard({ id: 'default-id' });

    expect(screen.getByText('Untitled Product')).toBeInTheDocument();
    expect(screen.getByText('₹0.00')).toBeInTheDocument();
    const imageElement = screen.getByRole('img');
    
    // FIX: A `src=""` attribute can be resolved differently by browsers/JSDOM.
    // It can be an empty string or the full page URL. This check handles both cases.
    const possibleSrcValues = ['', window.location.href];
    expect(possibleSrcValues).toContain(imageElement.src);
  });
});
