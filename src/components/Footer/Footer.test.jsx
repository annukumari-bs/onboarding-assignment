import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

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
    
    const headings = screen.getAllByRole('heading', { name: /lorem ipsum/i });
    
    expect(headings).toHaveLength(3);
  });

  it('should render all the links in the lists', () => {
    renderFooter();

    const links = screen.getAllByRole('link', { name: /lorem/i });

    expect(links).toHaveLength(15);
  });

  it('ensures all links have a placeholder href attribute', () => {
    renderFooter();

    const links = screen.getAllByRole('link', { name: /lorem/i });
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/');
    });
  });
});
