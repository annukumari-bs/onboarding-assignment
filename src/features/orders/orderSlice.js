import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserOrders, placeOrder as placeOrderAPI } from '../../api/orders/orders';

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (userId, { rejectWithValue }) => {
        try {
            return await fetchUserOrders(userId);
        } catch (error) {
            return rejectWithValue(error.toString());
        }
    }
);

export const placeOrder = createAsyncThunk(
    'orders/placeOrder',
    async (orderPayload, { rejectWithValue }) => {
        try {
            return await placeOrderAPI(orderPayload);
        } catch (error) {
            return rejectWithValue(error.toString());
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchOrders.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
            .addCase(placeOrder.pending, (state) => { state.status = 'loading'; })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders.unshift(action.payload);
            })
            .addCase(placeOrder.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
    },
});

export default ordersSlice.reducer;

