import { Link } from 'react-router-dom';
import productImage from '../../assets/product.png';

const ProductCard = ({ 
  title = 'Untitled Product',
  price = 0,
  image = '',
  id 
}) => {

  const handleImageError = (e) => {
    e.target.src = productImage;
  };

  return (
    <article className="w-full max-w-xs overflow-hidden transition-shadow duration-300 flex flex-col group">
      <Link to={`/product/${id}`} aria-label={`View details for ${title}`} className="flex flex-col flex-grow">
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            onError={handleImageError}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="py-2 flex flex-col flex-grow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate w-full" title={title}>{title}</h3>
          <div className="mt-auto pt-2">
            <p className="text-lg font-medium text-black">
              <span className="sr-only">Price:</span>
              ₹{price.toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
