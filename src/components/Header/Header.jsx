import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PiHandbagSimpleLight } from "react-icons/pi";
import { IoSearchOutline } from "react-icons/io5";
import { truncateQuantity } from '../../utils/helper.js';

const Header = () => {
  const cartItems = useSelector(state => state?.cart?.items) || [];
  
  const totalUniqueItemsInCart = cartItems.length;

  return (
    <header className="bg-white shadow-md px-4 sm:px-12 lg:px-28 py-4 flex items-center justify-between sticky w-full top-0 z-50">
      <div className='flex md:gap-10 gap-3 justify-center items-center'>
        <Link to="/" className="text-2xl font-bold text-black">
          Website
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-10">
          <Link to="/orders" className="hover:text-blue-600 transition">My Orders</Link>
        </nav>
        <div className='hidden md:flex gap-2 justify-center items-center'>
          <label htmlFor="header-search" className="sr-only">Search</label>
          <IoSearchOutline className="w-5 h-5 transition" aria-hidden="true" />
          <input type="text" id="header-search" placeholder='Search' className='text-gray-500' />
        </div>
      </div>
      
      <div className='flex gap-10 justify-center items-center'>

        <div className='flex gap-10 justify-center items-center'>
          <Link to="/cart" className="relative flex flex-row gap-1" aria-label={`View shopping cart, ${totalUniqueItemsInCart} items`}>
            <PiHandbagSimpleLight className="w-6 h-6 text-gray-700 hover:text-blue-600 transition" aria-hidden="true" />
            
            {totalUniqueItemsInCart > 0 && (
              <>
                <span aria-live="polite" className="sr-only">{`${totalUniqueItemsInCart} items in cart`}</span>
                <span className="" aria-hidden="true">
                  {truncateQuantity(totalUniqueItemsInCart)}
                </span>
              </>
            )}
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-blue-600 transition hidden md:block">Login</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
