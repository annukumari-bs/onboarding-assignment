import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header/Header';
import ProductListingPage from './pages/ProductListingPage/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage'
import { fetchCart } from './features/cart/cartSlice';
import { fetchProducts } from './features/products/productSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<ProductListingPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;