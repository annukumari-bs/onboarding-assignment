import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

// Helper function to render the component within a router context
const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer', () => {
  it('should render all three column headings', () => {
    renderFooter();
    
    // Find all headings with the text "Lorem Ipsum"
    const headings = screen.getAllByRole('heading', { name: /lorem ipsum/i });
    
    // Assert that there are exactly 3 such headings
    expect(headings).toHaveLength(3);
  });

  it('should render all the links in the lists', () => {
    renderFooter();

    // Find all links with the text "Lorem"
    const links = screen.getAllByRole('link', { name: /lorem/i });

    // Assert that there are 15 links (5 in each of the 3 columns)
    expect(links).toHaveLength(15);
  });

  it('ensures all links have a placeholder href attribute', () => {
    renderFooter();

    const links = screen.getAllByRole('link', { name: /lorem/i });
    
    // Check that each link has the correct href as resolved by react-router-dom
    links.forEach(link => {
      // FIX: A <Link to="#"> is resolved to "/" by the router.
      expect(link).toHaveAttribute('href', '/');
    });
  });
});
