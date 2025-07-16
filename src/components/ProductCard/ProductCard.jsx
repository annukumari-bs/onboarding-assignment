import { Link } from 'react-router-dom';
import { useCartControls } from '../../hooks/useCartControls';
import { truncateQuantity } from '../../utils/helper.js';
import { FALLBACK_IMAGES } from '../../constants';

const ProductCard = ({ 
  title = 'Untitled Product',
  price = 0,
  image = '',  
  rating = 0,
  id 
}) => {
  const { quantityInCart, handleIncrement, handleDecrement, status } = useCartControls(id, title);

  const handleImageError = (e) => {
    const fallbackIndex = id % FALLBACK_IMAGES.length;
    e.target.src = FALLBACK_IMAGES[fallbackIndex];
  };

  return (
    <Link to={`/product/${id}`} className="w-full max-w-xs bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border flex flex-col group">
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          onError={handleImageError}
          className="h-40 sm:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate w-full" title={title}>{title}</h3>
        <p className="text-sm text-gray-600 mb-1">Rating: {rating.toFixed(1)} ★</p>
        <div className="mt-auto pt-2">
          <p className="text-lg md:text-xl font-bold text-blue-600">₹{price.toFixed(2)}</p>
          <div className="mt-2">
            {quantityInCart === 0 ? (
              <button
                onClick={handleIncrement}
                disabled={status === 'loading'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium disabled:bg-gray-400 disabled:cursor-wait"
              >
                {status === 'loading' ? 'Adding...' : 'Add to Cart'}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDecrement}
                  disabled={status === 'loading'}
                  className="bg-gray-200 text-gray-800 font-bold w-10 h-10 rounded-full text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">
                  {status === 'loading' ? '...' : truncateQuantity(quantityInCart)}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={status === 'loading'}
                  className="bg-gray-200 text-gray-800 font-bold w-10 h-10 rounded-full text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;