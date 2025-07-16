import { BASE_URL } from '../../constants/index';

export async function getCartItems() {
  try {
    const response = await fetch(`${BASE_URL}/carts`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch cart items');
    return data;
  } catch (err) {
    console.error('API Error (getCartItems):', err);
    throw err;
  }
}

export async function postToCart(payload) {
  try {
    const response = await fetch(`${BASE_URL}/carts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to POST to cart');
    return data;
  } catch (err) {
    console.error('API Error (postToCart):', err);
    throw err;
  }
}

export async function deleteCartItem(cartItemId) {
    try {
      const response = await fetch(`${BASE_URL}/carts/${cartItemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to DELETE cart item');
      }
      return { _id: cartItemId, deleted: true };
    } catch (err) {
      console.error('API Error (deleteCartItem):', err);
      throw err;
    }
}
