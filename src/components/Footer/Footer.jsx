import { Link } from 'react-router-dom';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lorem Ipsum</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lorem Ipsum</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lorem Ipsum</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
              <li><Link to="#" className="hover:text-gray-900">Lorem</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
