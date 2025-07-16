import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PiHandbagSimpleLight } from "react-icons/pi";
import { IoSearchOutline } from "react-icons/io5";
import { truncateQuantity } from '../../utils/helper.js';

const Header = () => {
  const cartItems = useSelector(state => state?.cart?.items) || [];
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-md px-4 sm:px-12 lg:px-28 py-4 flex items-center justify-between sticky w-full top-0 z-50">
      <div className='flex gap-10 justify-center items-center'>
        <Link to="/" className="text-2xl font-bold text-gray-600">
          Website
        </Link>
        <Link to="/orders" className="hover:text-blue-600 transition">My Orders</Link>
        <div className='hidden md:flex gap-2 justify-center items-center'>
          <IoSearchOutline className="w-5 h-5 transition"/>
          <input type="text" placeholder='Search' className='text-gray-500' />
        </div>
      </div>
      <div className='flex gap-10 justify-center items-center'>
      <Link to="/cart" className="relative" aria-label="View shopping cart">
        <PiHandbagSimpleLight className="w-6 h-6 text-gray-700 hover:text-blue-600 transition" />
        {totalItemsInCart > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-9 h-5 rounded-full flex items-center justify-center">
            {truncateQuantity(totalItemsInCart)}
          </span>
        )}
      </Link>
      <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
      </div>
    </header>
  );
};

export default Header;
