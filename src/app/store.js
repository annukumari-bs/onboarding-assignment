import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import filtersReducer from '../features/filters/filterSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from '../features/orders/orderSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    filters: filtersReducer,
    pagination: paginationReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});