import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCartItems,
  postToCart,
  deleteCartItem,
} from './cart.js';

globalThis.fetch = vi.fn();

const createFetchResponse = (ok, data) => {
  return { ok, json: () => Promise.resolve(data) };
};

describe('Cart API Utility Functions', () => {

  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  describe('getCartItems', () => {
    it('should fetch cart items successfully', async () => {
      const mockCartData = [{ productId: 1, quantity: 2 }];
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(true, mockCartData));

      const data = await getCartItems();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/carts'));
      expect(data).toEqual(mockCartData);
    });

    it('should throw an error on a failed response', async () => {
      // Your API function correctly throws the message from the API response body.
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(false, { message: 'Server Error' }));
      
      // FIX: The test now expects the specific error message from the mock.
      await expect(getCartItems()).rejects.toThrow('Server Error');
    });
  });

  describe('postToCart', () => {
    it('should POST an item to the cart and return the response', async () => {
      const payload = { productId: 1, quantity: 1 };
      const mockResponse = { _id: 'new-item-id', ...payload };
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(true, mockResponse));

      const data = await postToCart(payload);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carts'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );
      expect(data).toEqual(mockResponse);
    });

    it('should throw an error on a failed POST request', async () => {
        vi.mocked(fetch).mockResolvedValue(createFetchResponse(false, { message: 'Invalid data' }));
        const payload = { productId: 1, quantity: 1 };
        await expect(postToCart(payload)).rejects.toThrow('Invalid data');
    });
  });

  describe('deleteCartItem', () => {
    it('should send a DELETE request for a cart item and return a success object', async () => {
      const cartItemId = 'abc-123';
      vi.mocked(fetch).mockResolvedValue(createFetchResponse(true, {}));

      const result = await deleteCartItem(cartItemId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/carts/${cartItemId}`),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toEqual({ _id: cartItemId, deleted: true });
    });

    it('should throw an error on a failed DELETE request', async () => {
        const cartItemId = 'abc-123';
        vi.mocked(fetch).mockResolvedValue(createFetchResponse(false, { message: 'Item not found' }));
        await expect(deleteCartItem(cartItemId)).rejects.toThrow('Item not found');
    });
  });
});
