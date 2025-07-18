import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart, removeFromCart } from '../features/cart/cartSlice';

export const useCartControls = (productId, productTitle) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('idle');

  const cartItem = useSelector(state =>
    state.cart.items.find(item => item.productId === productId)
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleIncrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStatus('loading');
    const newQuantity = quantityInCart + 1;
    dispatch(addToCart({ productId, quantity: newQuantity }))
      .unwrap()
      .then(() => {
        setStatus('idle');
        toast.success(quantityInCart === 0 ? `${productTitle} added to cart!` : 'Quantity updated!');
      })
      .catch(() => {
        setStatus('idle');
        toast.error('Failed to update cart.');
      });
  };

  const handleDecrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStatus('loading');
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => {
        setStatus('idle');
        toast.info('Item quantity updated.');
      })
      .catch(() => {
        setStatus('idle');
        toast.error('Failed to update cart.');
      });
  };

  return {
    quantityInCart,
    handleIncrement,
    handleDecrement,
    status,
  };
};
