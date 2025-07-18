import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { placeOrder } from '../../features/orders/orderSlice';
import { clearCart } from '../../features/cart/cartSlice';
import { deleteFromCart } from '../../features/cart/cartSlice';
import { FALLBACK_IMAGES } from '../../constants';

const CheckoutCartSummary = ({step}) => {
    const dispatch = useDispatch();
    const [loadingItemId, setLoadingItemId] = useState(null);
    const cartItems = useSelector(state => state.cart.items);
    const allProducts = useSelector(state => state.products.all);

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

    const populatedCartItems = useMemo(() => cartItems.map(item => {
        const productDetails = allProducts.find(p => p.id === item.productId);
        return { ...item, ...productDetails };
    }).filter(item => item.id), [cartItems, allProducts]);

    const subtotal = populatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleImageError = (e, productId) => {
        const fallbackIndex = productId % FALLBACK_IMAGES.length;
        e.target.src = FALLBACK_IMAGES[fallbackIndex];
    };

    return (
        <div className="lg:w-2/5 bg-gray-50 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Your cart</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {populatedCartItems.map(item => {
                    const isLoading = loadingItemId === item.productId;
                    return (
                    <div key={item.productId} className={`flex items-center gap-4 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
                        <img src={item.image} onError={(e) => handleImageError(e, item.productId)} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover" />
                        <div className='flex flex-col w-full'>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-bold text-gray-900">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
                                <button onClick={() => handleAction(deleteFromCart(item.productId), item.productId, item.title)} disabled={isLoading} className="text-gray-500 hover:text-red-600 text-sm underline disabled:cursor-not-allowed">Remove</button>
                            </div>
                        </div> 
                    </div>
             )})}
            </div>
            {step !== 'payment' && populatedCartItems.length > 0 && (
            <div className="border-t mt-8 pt-6 space-y-4">
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
            )}
        </div>
    );
};


const CheckoutPage = () => {
    const [step, setStep] = useState('address');
    const [formData, setFormData] = useState({
        firstName: 'John', lastName: 'Doe', addressLine1: '11, Somebuilding',
        addressLine2: '', city: 'Mumbai', zipcode: '123123',
        cardholderName: '', cardNumber: '', month: '', year: '', cvc: ''
    });
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);

    const validateStep = (currentStep) => {
        const newErrors = {};
        const currentYearLastTwoDigits = new Date().getFullYear() % 100;

        if (currentStep === 'address') {
            if (!formData.firstName) newErrors.firstName = 'First name is required.';
            if (!formData.lastName) newErrors.lastName = 'Last name is required.';
            if (!formData.addressLine1) newErrors.addressLine1 = 'Address is required.';
            if (!formData.city) newErrors.city = 'City is required.';
            if (!/^\d{6}$/.test(formData.zipcode)) newErrors.zipcode = 'Must be a 6-digit zip code.';
        }
        if (currentStep === 'payment') {
            if (!formData.cardholderName) newErrors.cardholderName = 'Cardholder name is required.';
            if (!/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Must be a 16-digit card number.';
            
            const monthNum = parseInt(formData.month, 10);
            if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                newErrors.month = 'Invalid month (01-12).';
            }

            const yearNum = parseInt(formData.year, 10);
            if (isNaN(yearNum) || yearNum < currentYearLastTwoDigits) {
                newErrors.year = `Year must be ${currentYearLastTwoDigits} or later.`;
            }

            if (!/^\d{3}$/.test(formData.cvc)) newErrors.cvc = 'Must be 3 digits.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (['cardNumber', 'month', 'year', 'cvc', 'zipcode'].includes(name)) {
            const numericValue = value.replace(/\D/g, '');
            let processedValue = numericValue;

            if (name === 'cardNumber') processedValue = numericValue.slice(0, 16);
            else if (name === 'month' || name === 'year') processedValue = numericValue.slice(0, 2);
            else if (name === 'cvc') processedValue = numericValue.slice(0, 3);
            else if (name === 'zipcode') processedValue = numericValue.slice(0, 6);
            
            setFormData(prev => ({ ...prev, [name]: processedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (validateStep('address')) {
            setStep('payment');
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep('payment')) return;
        
        const { firstName, lastName, addressLine1, addressLine2, city, zipcode } = formData;
        const orderPayload = {
            userId: "88",
            products: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED",
            shippingAddress: { firstName, lastName, addressLine1, addressLine2, city, zipcode, contactNo: '123123123123' }
        };

        try {
            await dispatch(placeOrder(orderPayload)).unwrap();
            toast.success("Order placed successfully!");
            dispatch(clearCart());
            navigate('/orders');
        } catch (error) {
            toast.error("Failed to place order.");
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center sm:text-left">Checkout</h1>
            <div className="flex flex-col-reverse lg:flex-row gap-12">
                <div className="lg:w-3/5">
                    <div className="flex items-center mb-6 w-full max-w-md mx-auto lg:mx-32">
                        <span className={`font-semibold ${step === 'address' ? 'text-black' : 'text-gray-500'}`}>Address</span>
                        <div className="flex-grow border-t mx-4"></div>
                        <span className={`font-semibold ${step === 'payment' ? 'text-black' : 'text-gray-500'}`}>Payment</span>
                    </div>

                    {step === 'address' && (
                        <form onSubmit={handleAddressSubmit} noValidate>
                            <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <input name="addressLine1" type="text" placeholder="Address" value={formData.addressLine1} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <input name="addressLine2" type="text" placeholder="Apartment, suite, etc. (optional)" value={formData.addressLine2} onChange={handleChange} className="p-2 border rounded-md border-gray-300 w-full" />
                                </div>
                                <div>
                                    <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <input name="zipcode" type="text" placeholder="Zipcode" value={formData.zipcode} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.zipcode ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.zipcode && <p className="text-red-500 text-xs mt-1">{errors.zipcode}</p>}
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition">
                                Continue to Payment
                            </button>
                        </form>
                    )}

                    {step === 'payment' && (
                        <form onSubmit={handlePaymentSubmit} noValidate>
                             <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
                             <div className="space-y-4">
                                <div>
                                    <input name="cardholderName" type="text" placeholder="Cardholder Name" value={formData.cardholderName} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
                                </div>
                                <div>
                                    <input name="cardNumber" type="text" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <input name="month" type="text" placeholder="Month (MM)" value={formData.month} onChange={handleChange} className={`p-2 border rounded-md w-full ${errors.month ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
                                    </div>
                                    <div>
                                        <input name="year" type="text" placeholder="Year (YY)" value={formData.year} onChange={handleChange} className={`p-2 border rounded-md w-full ${errors.year ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <input name="cvc" type="text" placeholder="CVC" value={formData.cvc} onChange={handleChange} className={`p-2 border rounded-md w-full ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                                    </div>
                                </div>
                             </div>
                             <button type="submit" className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition">
                                Pay with card
                            </button>
                        </form>
                    )}
                </div>
                <CheckoutCartSummary  step={step}/>
            </div>
        </div>
    );
};

export default CheckoutPage;
