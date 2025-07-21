import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUserOrders, placeOrder } from './orders';
import { BASE_URL } from '../../constants/index';

vi.mock('../../constants/index', () => ({
    BASE_URL: 'http://api.test.com'
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('Orders API', () => {

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchUserOrders', () => {
    const mockUserId = 'user-123';
    const mockOrders = [{ id: 'order-1', total: 100 }];

    it('should fetch user orders successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const result = await fetchUserOrders(mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/orders/user/${mockUserId}`);
      expect(result).toEqual(mockOrders);
    });

    it('should throw an error if the fetch response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Not Found' }),
      });

      await expect(fetchUserOrders(mockUserId)).rejects.toThrow('Not Found');
    });

    it('should throw an error if the fetch call fails', async () => {
        const networkError = new Error('Network failure');
        mockFetch.mockRejectedValue(networkError);
        await expect(fetchUserOrders(mockUserId)).rejects.toThrow('Network failure');
      });
  });

  describe('placeOrder', () => {
    const mockOrderPayload = { userId: 'user-123', products: [] };
    const mockApiResponse = { id: 'new-order-1', ...mockOrderPayload };

    it('should place an order successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await placeOrder(mockOrderPayload);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockOrderPayload),
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should throw an error if placing an order fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid data' }),
      });

      await expect(placeOrder(mockOrderPayload)).rejects.toThrow('Invalid data');
    });

    it('should throw an error if the placeOrder fetch call fails', async () => {
        const networkError = new Error('Network failure');
        mockFetch.mockRejectedValue(networkError);
        
        await expect(placeOrder(mockOrderPayload)).rejects.toThrow('Network failure');
      });
  });
});
