import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteFromCart } from '../../features/cart/cartSlice';
import { truncateQuantity } from '../../utils/helper.js';
import productImage from '../../assets/product.png';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = `accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="border-b">
            <h2>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="w-full flex justify-between items-center py-4 text-left text-gray-700"
                >
                    <span className="font-semibold">{title}</span>
                    <span className="text-2xl font-light" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
            </h2>
            {isOpen && (
                <div id={contentId} role="region" className="pb-4 pr-4 text-gray-600">
                    {children}
                </div>
            )}
        </div>
    );
};


const CartPage = () => {
  const dispatch = useDispatch();
  const { items: cartItems, status: cartStatus } = useSelector(state => state.cart);
  const allProducts = useSelector(state => state.products.all);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  const populatedCartItems = useMemo(() => {
    if (!allProducts.length) return [];
    return cartItems.map(item => {
      const productDetails = allProducts.find(p => String(p.id) === String(item.productId));
      return { ...item, ...productDetails };
    }).filter(item => item.id);
  }, [cartItems, allProducts]);

  const subtotal = populatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleAction = async (action, itemId, itemTitle) => {
    setLoadingItemId(itemId);
    try {
      await dispatch(action).unwrap();
      toast.error(`${itemTitle} removed from cart.`);
    } catch (error) {
      toast.error("Failed to update cart.", error);
    } finally {
      setLoadingItemId(null);
    }
  };
  
  const handleImageError = (e) => {
    e.target.src = productImage;
  };

  if (cartStatus === 'loading' && cartItems.length === 0) {
    return <div className="text-center py-10" role="status">Loading Your Cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
        <main className="text-center py-20 px-4">
            <h1 className="text-3xl font-bold text-gray-700">Your Cart is Empty</h1>
            <Link to="/" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                Continue Shopping
            </Link>
        </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Your cart</h1>
      <p className="mb-8 text-gray-500">Not ready to checkout? <Link to="/" className="text-blue-600 underline">Continue Shopping</Link></p>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <section className="lg:w-2/3" aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="sr-only">Items in your shopping cart</h2>
          <div className="space-y-6">
            {populatedCartItems.map(item => {
              const isLoading = loadingItemId === item.productId;
              return (
                <div 
                  key={item.productId} 
                  className={`flex flex-col sm:flex-row items-start bg-white p-4 rounded-lg shadow-sm transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                  aria-busy={isLoading}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    onError={handleImageError}
                    className="w-full sm:w-24 sm:h-24 h-48 object-cover mb-4 sm:mb-0" 
                  />
                  <div className="ml-0 sm:ml-6 flex-grow w-full">
                    <div className="flex justify-between lg:flex-col flex-row">
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-lg font-bold text-gray-900 sm:hidden">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
                      <p className="text-base font-medium text-gray-900">Quantity: {truncateQuantity(item.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xl font-bold text-gray-900 mb-2 hidden sm:block">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
                      <button 
                        onClick={() => handleAction(deleteFromCart(item.productId), item.productId, item.title)} 
                        disabled={isLoading} 
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-gray-500 hover:text-red-600 text-sm underline disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            
            <div className="mb-6">
                <label htmlFor="coupon" className="sr-only">Coupon Code</label>
                <input 
                    type="text" 
                    id="coupon"
                    placeholder='Enter coupon code here' 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full border-gray-300 border rounded-md shadow-sm p-2"
                />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-sm text-gray-500">Calculated at next step</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="block text-center w-full mt-8 bg-gray-900 text-white py-3 hover:bg-gray-700 transition">
              Continue to checkout
            </Link>
          </div>
        </aside>
      </div>
      <section className="mt-16 lg:w-2/3" aria-labelledby="order-info-heading">
        <h2 id="order-info-heading" className="text-2xl font-bold text-gray-800 mb-4">Order Information</h2>
        <div className="border-t">
            <AccordionItem title="Return Policy">
                <p>This is our example return policy which is everything you need to know about our returns.</p>
            </AccordionItem>
            <AccordionItem title="Shipping Options">
                <p>We offer various shipping options to suit your needs. Standard, Express, and Next-Day delivery available. Costs and times are calculated at checkout.</p>
            </AccordionItem>
             <AccordionItem title="Contact Us">
                <p>Have a question? You can reach our support team at <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a> or call us at 1-800-123-4567.</p>
            </AccordionItem>
        </div>
      </section>
    </main>
  );
};

export default CartPage;
