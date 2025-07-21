import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchAllProducts,
  fetchProductById,
  getProducts,
} from './product.js';

globalThis.fetch = vi.fn();

const createFetchResponse = (ok, data) => {
  return { ok, json: () => new Promise((resolve) => resolve(data)) };
};

describe('API Utility Functions', () => {

  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockData = { products: [{ id: 1, name: 'Test Product' }] };
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(true, mockData));

      const data = await getProducts();
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/products?'));
      expect(data).toEqual(mockData);
    });

    it('should throw an error on a failed response', async () => {
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(false, { message: 'Server Error' }));
      await expect(getProducts()).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('fetchAllProducts', () => {
    it('should paginate through all products and return a combined list', async () => {
      const page1 = { products: Array(100).fill({ id: 1 }) };
      const page2 = { products: Array(50).fill({ id: 2 }) };
      const emptyPage = { products: [] };

      vi.mocked(fetch)
        .mockResolvedValueOnce(createFetchResponse(true, page1))
        .mockResolvedValueOnce(createFetchResponse(true, page2))
        .mockResolvedValueOnce(createFetchResponse(true, emptyPage));

      const result = await fetchAllProducts();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result.products.length).toBe(150);
    });
  });

  describe('fetchProductById', () => {
    it('should fetch a single product successfully', async () => {
      const mockProduct = { id: 5, title: 'OPPOF19' };
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(true, mockProduct));
      
      const data = await fetchProductById(5);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/products/5'));
      expect(data).toEqual(mockProduct);
    });

    it('should throw an error on a failed response', async () => {
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(false, { message: 'Not Found' }));
      
      await expect(fetchProductById(999)).rejects.toThrow('Not Found');
    });
  }); 
});
