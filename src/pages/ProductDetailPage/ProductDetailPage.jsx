import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById } from '../../features/products/productSlice';
import { useCartControls } from '../../hooks/useCartControls';
import { FALLBACK_IMAGES } from '../../constants';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, status: productStatus } = useSelector(state => state.products);
  
  const { quantityInCart, handleIncrement, handleDecrement, status: cartStatus } = useCartControls(currentProduct?.id, currentProduct?.title);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  const handleImageError = (e) => {
    const fallbackIndex = id % FALLBACK_IMAGES.length;
    e.target.src = FALLBACK_IMAGES[fallbackIndex];
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
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.title} 
                  onError={handleImageError} // <-- ADD ONERROR HANDLER
                  className="w-full h-auto object-cover rounded-lg shadow-lg" 
                />
            </div>
            <img src="https://placehold.co/400x400/f0f0f0/ccc?text=+" alt="thumbnail" className="w-full h-auto object-cover rounded-lg" />
            <img src="https://placehold.co/400x400/f0f0f0/ccc?text=+" alt="thumbnail" className="w-full h-auto object-cover rounded-lg" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{currentProduct.title}</h1>
          <p className="text-3xl text-gray-900 mb-4">₹{currentProduct.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{currentProduct.description}</p>
          
          <div className="flex items-center gap-6">
            {quantityInCart === 0 ? (
                <button 
                  onClick={handleIncrement}
                  disabled={cartStatus === 'loading'}
                  className="bg-gray-900 text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-700 transition flex-grow disabled:bg-gray-400"
                >
                    {cartStatus === 'loading' ? 'Adding...' : `Add to Cart - ₹${currentProduct.price.toFixed(2)}`}
                </button>
            ) : (
                <div className="flex items-center border rounded-md p-1">
                    <button onClick={handleDecrement} disabled={cartStatus === 'loading'} className="px-4 py-2 text-lg font-medium disabled:opacity-50">-</button>
                    <span className="px-5 py-2 text-lg">{cartStatus === 'loading' ? '...' : quantityInCart}</span>
                    <button onClick={handleIncrement} disabled={cartStatus === 'loading'} className="px-4 py-2 text-lg font-medium disabled:opacity-50">+</button>
                </div>
            )}
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
