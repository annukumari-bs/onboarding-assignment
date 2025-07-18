import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { fetchProductById } from '../../features/products/productSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { FALLBACK_IMAGES } from '../../constants';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { currentProduct, status: productStatus } = useSelector(state => state.products);
  const wishlistedItems = useSelector(state => state.wishlist?.items || []);
  const cartItem = useSelector(state => state.cart.items.find(item => item.productId === currentProduct?.id));

  const isWishlisted = currentProduct ? wishlistedItems.includes(currentProduct.id) : false;
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isAlreadyInCart = quantityInCart > 0;
  const hasQuantityChanged = isAlreadyInCart && quantity !== quantityInCart;

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  const handleCartAction = async () => {
    if (!currentProduct) return;
    setIsLoading(true);
    try {
      await dispatch(addToCart({ productId: currentProduct.id, quantity })).unwrap();
      toast.success(isAlreadyInCart ? 'Cart updated!' : `${quantity} x ${currentProduct.title} added to cart!`);
    } catch  {
      toast.error('Failed to update cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistClick = () => {
    if (!currentProduct) return;
    dispatch(toggleWishlist(currentProduct.id));
    toast.success(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!');
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Product link copied to clipboard!');
  };

  const handleImageError = (e) => {
    const fallbackIndex = Number(id) % FALLBACK_IMAGES.length;
    e.target.src = FALLBACK_IMAGES[fallbackIndex];
  };

  const renderActionButton = () => {
    if (isAlreadyInCart && !hasQuantityChanged) {
      return (
        <button
          onClick={() => navigate('/cart')}
          className="w-full bg-green-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-green-700 transition"
        >
          Go to Cart
        </button>
      );
    }

    const buttonText = isAlreadyInCart ? 'Update Cart' : 'Add to Cart';
    return (
      <button
        onClick={handleCartAction}
        disabled={isLoading}
        className="bg-gray-900 text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-700 transition flex-grow disabled:bg-gray-400 disabled:cursor-wait"
      >
        {isLoading ? 'Updating...' : `${buttonText} - ₹${(currentProduct.price * quantity).toFixed(2)}`}
      </button>
    );
  };

  if (productStatus === 'loading') {
    return <div className="text-center py-20">Loading Product...</div>;
  }

  if (productStatus === 'failed' || !currentProduct) {
    return <div className="text-center py-20">Failed to load product. Please try again.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <img src={currentProduct.image} alt={currentProduct.title} onError={handleImageError} className="w-full h-auto object-cover rounded-lg shadow-lg" />
            </div>
            <img src="https://placehold.co/400x400/f0f0f0/ccc?text=+" alt="thumbnail" className="w-full h-auto object-cover rounded-lg" />
            <img src="https://placehold.co/400x400/f0f0f0/ccc?text=+" alt="thumbnail" className="w-full h-auto object-cover rounded-lg" />
        </div>

        <div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-4xl font-bold text-gray-800 flex-grow">{currentProduct.title}</h1>
            <div className="flex items-center gap-4 pl-4">
              <button onClick={handleWishlistClick} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                <FiHeart className={`w-6 h-6 transition-all ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-500 hover:text-red-500'}`} />
              </button>
              <button onClick={handleShareClick} aria-label="Share product">
                <FiShare2 className="w-6 h-6 text-gray-500 hover:text-blue-600"/>
              </button>
            </div>
          </div>
          <p className="text-3xl text-gray-900 mb-4">₹{currentProduct.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{currentProduct.description}</p>
          
          <div className="flex items-center gap-6">
            {renderActionButton()}
            <div className="flex items-center border rounded-md p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="px-4 py-2 text-lg font-medium disabled:opacity-50">-</button>
                <span className="px-5 py-2 text-lg font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-lg font-medium">+</button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
              <p>✓ Free standard shipping</p>
              <p>✓ Free Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;