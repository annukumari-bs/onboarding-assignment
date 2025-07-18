import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../../features/orders/orderSlice';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { orders, status } = useSelector(state => state.orders);
    const allProducts = useSelector(state => state.products.all);
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchOrders(1));
        }
    }, [status, dispatch]);

    const ordersWithTotals = useMemo(() => {
        if (!orders?.length || !allProducts?.length) return [];
        
        const calculatedOrders = orders.map(order => {
            const totalAmount = order.products.reduce((acc, orderProduct) => {
                const productDetails = allProducts.find(p => p.id === orderProduct.productId);
                if (productDetails) {
                    return acc + (productDetails.price * orderProduct.quantity);
                }
                return acc;
            }, 0);
            return { ...order, totalAmount };
        });
        return calculatedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    }, [orders, allProducts]);

    const filteredOrders = useMemo(() => {
        if (timeFilter === 'all') {
            return ordersWithTotals;
        }
        
        const now = new Date();
        const daysToFilter = parseInt(timeFilter, 10);
        
        return ordersWithTotals.filter(order => {
            const orderDate = new Date(order.date);
            const diffTime = now - orderDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= daysToFilter;
        });
    }, [ordersWithTotals, timeFilter]);

    const getStatusChip = (orderStatus) => {
        const baseClasses = "px-3 py-1 text-xs font-medium rounded-full capitalize";
        switch (orderStatus?.toLowerCase()) {
            case 'confirmed':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'cancelled':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'shipped':
                 return `${baseClasses} bg-blue-100 text-blue-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
                <div>
                    <label htmlFor="time-filter" className="sr-only">Filter orders by time</label>
                    <select 
                        id="time-filter"
                        className="border rounded-md px-3 py-1.5"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {status === 'loading' && <div className="text-center py-10" role="status">Loading your orders...</div>}
            {status === 'failed' && <div className="text-center py-10 text-red-500" role="alert">Failed to load orders.</div>}
            
            {status === 'succeeded' && (
                <section aria-live="polite" aria-atomic="true">
                    {filteredOrders.length > 0 ? (
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <caption className="sr-only">A table of your past orders, including order number, customer name, payment status, amount, address, date, and order status.</caption>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order?.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${order?.shippingAddress?.firstName} ${order?.shippingAddress?.lastName}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order?.paymentStatus?.toLowerCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order?.totalAmount?.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order?.shippingAddress?.city}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order?.date)?.toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={getStatusChip(order?.orderStatus)}>{order?.orderStatus}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            {orders.length > 0 ? 'No orders found for the selected time period.' : "You haven't placed any orders yet."}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
};

export default OrdersPage;
