import { BASE_URL } from '../../constants/index';

export async function fetchUserOrders(userId) {
  try {
      const response = await fetch(`${BASE_URL}/orders/user/${userId}`);
      
      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch orders');
      }

      return data;
  } catch (err) {
      console.error('API Error (fetchUserOrders):', err);
      throw err;
  }
}

export async function placeOrder(orderPayload) {
  try {
      const response = await fetch(`${BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to place order');
      return data;
  } catch (err) {
      console.error('API Error (placeOrder):', err);
      throw err;
  }
}