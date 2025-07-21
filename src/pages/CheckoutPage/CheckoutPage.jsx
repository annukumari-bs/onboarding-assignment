import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { placeOrder } from '../../features/orders/orderSlice';
import { clearCart } from '../../features/cart/cartSlice';
import { deleteFromCart } from '../../features/cart/cartSlice';
import productImage from '../../assets/product.png';

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

    const handleImageError = (e) => {
        e.target.src = productImage
    };

    return (
        <aside className="lg:w-2/5 bg-gray-50 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Your cart</h2>
            <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {populatedCartItems.map(item => {
                    const isLoading = loadingItemId === item.productId;
                    return (
                    <li key={item.productId} className={`flex items-center gap-4 transition-opacity ${isLoading ? 'opacity-50' : ''}`} aria-busy={isLoading}>
                        <img src={item.image} onError={handleImageError} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover" />
                        <div className='flex flex-col w-full'>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-bold text-gray-900">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
                                <button 
                                  onClick={() => handleAction(deleteFromCart(item.productId), item.productId, item.title)} 
                                  disabled={isLoading} 
                                  aria-label={`Remove ${item.title} from cart`}
                                  className="text-gray-500 hover:text-red-600 text-sm underline disabled:cursor-not-allowed">
                                    Remove
                                </button>
                            </div>
                        </div> 
                    </li>
             )})}
            </ul>
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
        </aside>
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
    const formRef = useRef(null);

    useEffect(() => {
        if (Object.keys(errors).length > 0 && formRef.current) {
            const firstErrorField = formRef.current.querySelector('[aria-invalid="true"]');
            if (firstErrorField) {
                firstErrorField.focus();
            }
        }
    }, [errors]);

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

    if (cartItems.length === 0) {
        return (
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-3xl font-bold text-gray-700 mb-6">Your cart is empty</h1>
                <Link to="/" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                    Continue Shopping
                </Link>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center sm:text-left">Checkout</h1>
            <div className="flex flex-col-reverse lg:flex-row gap-12">
                <section className="lg:w-3/5" aria-labelledby="checkout-heading">
                    <h2 id="checkout-heading" className="sr-only">Checkout form</h2>
                    <div className="flex items-center mb-6 w-full max-w-md mx-auto lg:mx-28" role="navigation" aria-label="Checkout steps">
                        {step === 'payment' ? (
                            <button onClick={() => setStep('address')} className="font-semibold" aria-current="false">Address</button>
                        ) : (
                            <span className={`font-semibold text-black`} aria-current="step">Address</span>
                        )}
                        <div className="flex-grow border-t mx-4" aria-hidden="true"></div>
                        <span className={`font-semibold ${step === 'payment' ? 'text-black' : 'text-gray-500'}`} aria-current={step === 'payment' ? 'step' : undefined}>Payment</span>
                    </div>

                    {step === 'address' && (
                        <form onSubmit={handleAddressSubmit} noValidate ref={formRef}>
                            <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="sr-only">First Name</label>
                                    <input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="First Name" value={formData.firstName} onChange={handleChange} aria-invalid={!!errors.firstName} aria-describedby="firstName-error" className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.firstName && <p id="firstName-error" className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="sr-only">Last Name</label>
                                    <input id="lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Last Name" value={formData.lastName} onChange={handleChange} aria-invalid={!!errors.lastName} aria-describedby="lastName-error" className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.lastName && <p id="lastName-error" className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="addressLine1" className="sr-only">Address</label>
                                    <input id="addressLine1" name="addressLine1" type="text" autoComplete="street-address" placeholder="Address" value={formData.addressLine1} onChange={handleChange} aria-invalid={!!errors.addressLine1} aria-describedby="addressLine1-error" className={`w-full p-2 border rounded-md ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.addressLine1 && <p id="addressLine1-error" className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="addressLine2" className="sr-only">Apartment, suite, etc. (optional)</label>
                                    <input id="addressLine2" name="addressLine2" type="text" autoComplete="address-line2" placeholder="Apartment, suite, etc. (optional)" value={formData.addressLine2} onChange={handleChange} className="p-2 border rounded-md border-gray-300 w-full" />
                                </div>
                                <div>
                                    <label htmlFor="city" className="sr-only">City</label>
                                    <input id="city" name="city" type="text" autoComplete="address-level2" placeholder="City" value={formData.city} onChange={handleChange} aria-invalid={!!errors.city} aria-describedby="city-error" className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.city && <p id="city-error" className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label htmlFor="zipcode" className="sr-only">Zipcode</label>
                                    <input id="zipcode" name="zipcode" type="text" autoComplete="postal-code" placeholder="Zipcode" value={formData.zipcode} onChange={handleChange} aria-invalid={!!errors.zipcode} aria-describedby="zipcode-error" className={`w-full p-2 border rounded-md ${errors.zipcode ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.zipcode && <p id="zipcode-error" className="text-red-500 text-xs mt-1">{errors.zipcode}</p>}
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition">
                                Continue to Payment
                            </button>
                        </form>
                    )}

                    {step === 'payment' && (
                        <form onSubmit={handlePaymentSubmit} noValidate ref={formRef}>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Payment Details</h2>
                                <button type="button" onClick={() => setStep('address')} className="text-sm text-blue-600 hover:underline">Back to address</button>
                             </div>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="cardholderName" className="sr-only">Cardholder Name</label>
                                    <input id="cardholderName" name="cardholderName" type="text" autoComplete="cc-name" placeholder="Cardholder Name" value={formData.cardholderName} onChange={handleChange} aria-invalid={!!errors.cardholderName} aria-describedby="cardholderName-error" className={`w-full p-2 border rounded-md ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.cardholderName && <p id="cardholderName-error" className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="cardNumber" className="sr-only">Card Number</label>
                                    <input id="cardNumber" name="cardNumber" type="text" autoComplete="cc-number" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} aria-invalid={!!errors.cardNumber} aria-describedby="cardNumber-error" className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.cardNumber && <p id="cardNumber-error" className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                </div>
                                <fieldset className="grid grid-cols-3 gap-4">
                                    <legend className="sr-only">Credit card expiration date and CVC</legend>
                                    <div>
                                        <label htmlFor="month" className="sr-only">Expiration Month (MM)</label>
                                        <input id="month" name="month" type="text" autoComplete="cc-exp-month" placeholder="Month (MM)" value={formData.month} onChange={handleChange} aria-invalid={!!errors.month} aria-describedby="month-error" className={`p-2 border rounded-md w-full ${errors.month ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.month && <p id="month-error" className="text-red-500 text-xs mt-1">{errors.month}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="year" className="sr-only">Expiration Year (YY)</label>
                                        <input id="year" name="year" type="text" autoComplete="cc-exp-year" placeholder="Year (YY)" value={formData.year} onChange={handleChange} aria-invalid={!!errors.year} aria-describedby="year-error" className={`p-2 border rounded-md w-full ${errors.year ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.year && <p id="year-error" className="text-red-500 text-xs mt-1">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="cvc" className="sr-only">CVC</label>
                                        <input id="cvc" name="cvc" type="text" autoComplete="cc-csc" placeholder="CVC" value={formData.cvc} onChange={handleChange} aria-invalid={!!errors.cvc} aria-describedby="cvc-error" className={`p-2 border rounded-md w-full ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.cvc && <p id="cvc-error" className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                                    </div>
                                </fieldset>
                             </div>
                             <button type="submit" className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition">
                                Pay with card
                            </button>
                        </form>
                    )}
                </section>
                <CheckoutCartSummary  step={step}/>
            </div>
        </main>
    );
};

export default CheckoutPage;
