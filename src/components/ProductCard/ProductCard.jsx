import { Link } from 'react-router-dom';
import { FALLBACK_IMAGES } from '../../constants';

const ProductCard = ({ 
  title = 'Untitled Product',
  price = 0,
  image = '',  
  rating = 0,
  id 
}) => {

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
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;