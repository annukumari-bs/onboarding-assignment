import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import OrdersPage from './OrdersPage';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

const mockFetchOrders = vi.fn();
vi.mock('../../features/orders/orderSlice', () => ({
  fetchOrders: () => mockFetchOrders,
}));


describe('OrdersPage', () => {
  const dispatch = vi.fn();

  const mockAllProducts = [
    { id: 1, name: 'Laptop', price: 1200 },
    { id: 2, name: 'Mouse', price: 25 },
  ];

  const getDateDaysAgo = (days) => new Date(new Date().setDate(new Date().getDate() - days)).toISOString();

  const mockOrdersData = [
    {
      id: 'order-recent',
      date: getDateDaysAgo(2),
      products: [{ productId: 1, quantity: 1 }],
      shippingAddress: { firstName: 'Jane', lastName: 'Doe', city: 'Mumbai' },
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    },
    {
      id: 'order-mid',
      date: getDateDaysAgo(15),
      products: [{ productId: 2, quantity: 2 }],
      shippingAddress: { firstName: 'John', lastName: 'Smith', city: 'Delhi' },
      paymentStatus: 'pending',
      orderStatus: 'shipped',
    },
    {
      id: 'order-old',
      date: getDateDaysAgo(40),
      products: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }],
      shippingAddress: { firstName: 'Peter', lastName: 'Jones', city: 'Pune' },
      paymentStatus: 'paid',
      orderStatus: 'cancelled',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
  });

  it('should dispatch fetchOrders on initial render if status is idle', () => {
    useSelector.mockReturnValue({ orders: [], status: 'idle' });
    render(<OrdersPage />);
    expect(dispatch).toHaveBeenCalledWith(mockFetchOrders);
  });

  it('should display a loading message when status is loading', () => {
    useSelector.mockReturnValue({ orders: [], status: 'loading' });
    render(<OrdersPage />);
    expect(screen.getByText(/Loading your orders.../i)).toBeInTheDocument();
  });

  it('should display an error message when status is failed', () => {
    useSelector.mockReturnValue({ orders: [], status: 'failed' });
    render(<OrdersPage />);
    expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument();
  });

  describe('when data is successfully loaded', () => {
    beforeEach(() => {
      useSelector.mockImplementation((selector) => {
        const mockState = {
          orders: { orders: mockOrdersData, status: 'succeeded' },
          products: { all: mockAllProducts },
        };
        return selector(mockState);
      });
    });

    it('should render orders sorted by newest first and calculate totals correctly', () => {
        render(<OrdersPage />);
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('#order-recent');
        expect(rows[2]).toHaveTextContent('#order-mid');
        expect(rows[3]).toHaveTextContent('#order-old');
        expect(screen.getByText('₹1200.00')).toBeInTheDocument();
        expect(screen.getByText('₹50.00')).toBeInTheDocument();
    });

    it('should filter orders based on the time filter dropdown', () => {
        render(<OrdersPage />);
        const filterSelect = screen.getByRole('combobox');
        
        expect(screen.getByText('#order-recent')).toBeInTheDocument();
        expect(screen.getByText('#order-mid')).toBeInTheDocument();
        expect(screen.getByText('#order-old')).toBeInTheDocument();

        fireEvent.change(filterSelect, { target: { value: '7' } });
        expect(screen.getByText('#order-recent')).toBeInTheDocument();
        expect(screen.queryByText('#order-mid')).not.toBeInTheDocument();
        expect(screen.queryByText('#order-old')).not.toBeInTheDocument();

        fireEvent.change(filterSelect, { target: { value: '30' } });
        expect(screen.getByText('#order-recent')).toBeInTheDocument();
        expect(screen.getByText('#order-mid')).toBeInTheDocument();
        expect(screen.queryByText('#order-old')).not.toBeInTheDocument();
        
        fireEvent.change(filterSelect, { target: { value: 'all' } });
        expect(screen.getByText('#order-recent')).toBeInTheDocument();
        expect(screen.getByText('#order-mid')).toBeInTheDocument();
        expect(screen.getByText('#order-old')).toBeInTheDocument();
    });
  });

  it('should display a message if no orders exist', () => {
    useSelector
        .mockReturnValueOnce({ orders: [], status: 'succeeded' })
        .mockReturnValueOnce({ all: mockAllProducts });
        
    render(<OrdersPage />);
    expect(screen.getByText(/You haven't placed any orders yet/i)).toBeInTheDocument();
  });

  it('should display a message if no orders match the filter', () => {
    const veryOldOrders = [{ ...mockOrdersData[2], id: 'order-very-old' }];
    
    useSelector.mockImplementation((selector) => {
        const mockState = {
            orders: { orders: veryOldOrders, status: 'succeeded' },
            products: { all: mockAllProducts },
        };
        return selector(mockState);
    });
    
    render(<OrdersPage />);
    const filterSelect = screen.getByRole('combobox');
    
    expect(screen.getByText('#order-very-old')).toBeInTheDocument();

    fireEvent.change(filterSelect, { target: { value: '7' } });
    
    expect(screen.getByText(/No orders found for the selected time period/i)).toBeInTheDocument();
  });
});