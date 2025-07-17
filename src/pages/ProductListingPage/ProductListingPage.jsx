import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts
} from '../../features/products/productSlice.js';
import {
  setCategory,
  setPrice,
  setRating,
  setSort,
  clearFilters,
} from '../../features/filters/filterSlice';
import {
  loadMore,
  resetPagination
} from '../../features/pagination/paginationSlice';
import ProductCard from '../../components/ProductCard/ProductCard';

const ProductListingPage = () => {
  const dispatch = useDispatch();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { all: allProducts, status } = useSelector((state) => state.products);
  const filters = useSelector((state) => state.filters);
  const itemsToShow = useSelector((state) => state.pagination.itemsToShow);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category));
    return Array.from(set);
  }, [allProducts]);

  const visibleCategories = useMemo(() => {
    return showAllCategories ? categories : categories.slice(0, 5);
  }, [categories, showAllCategories]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (filters.selectedCategories.length) {
      filtered = filtered.filter((product) =>
        filters.selectedCategories.includes(product.category)
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter((product) => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((product) => product.price <= Number(filters.maxPrice));
    }
    if (filters.minRating) {
      filtered = filtered.filter((product) => product.rating >= Number(filters.minRating));
    }

    const { key, direction } = filters.sort;
    filtered.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allProducts, filters]);

  const visibleProducts = filteredAndSortedProducts.slice(0, itemsToShow);
  const hasMoreToLoad = itemsToShow < filteredAndSortedProducts.length;

  return (
    <div className="py-8 px-4 md:px-12 lg:px-28">
      <h1 className="text-3xl font-semibold mb-3 text-left">E-Commerce Shop App</h1>
      <div className="w-full md:w-1/2 text-left text-gray-500 mb-10">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </div>

      <div className="flex flex-col md:flex-row w-full">
        <aside className="w-full md:w-1/4 lg:w-1/5 pr-0 md:pr-6 mb-8 md:mb-0">
          <div className="flex flex-row gap-4 items-baseline mb-4">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <button onClick={() => { dispatch(clearFilters()); dispatch(resetPagination()); }}
              className="underline text-sm text-gray-500 hover:text-gray-800">
              Clear All
            </button>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">Category</p>
            {visibleCategories.map((category) => (
              <label key={category} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedCategories.includes(category)}
                  onChange={() => { dispatch(setCategory(category)); dispatch(resetPagination()); }}
                />
                <span className="capitalize">{category}</span>
              </label>
            ))}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                {showAllCategories ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">Price Range</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => dispatch(setPrice({ min: e.target.value, max: filters.maxPrice }))}
                className="w-full border rounded-md px-2 py-1"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => dispatch(setPrice({ min: filters.minPrice, max: e.target.value }))}
                className="w-full border rounded-md px-2 py-1"
              />
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold mb-2">Rating</p>
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === `${rating}`}
                  onChange={() => { dispatch(setRating(`${rating}`)); dispatch(resetPagination()); }}
                />
                {rating} ★ & above
              </label>
            ))}
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{filteredAndSortedProducts.length} Products Found</p>
            <select
              onChange={(e) => dispatch(setSort({
                key: e.target.value.split('-')[0],
                direction: e.target.value.split('-')[1],
              }))}
              value={`${filters.sort.key}-${filters.sort.direction}`}
              className="border rounded-md px-3 py-1.5"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>

          {status === 'loading' && (
            <div className="text-center py-10">Loading products...</div>
          )}

          {status === 'succeeded' && (
            <>
              {allProducts.length === 0 ? (
                <p className="col-span-full text-center py-10 text-gray-500">No Products Found.</p>
              ) : filteredAndSortedProducts.length === 0 ? (
                <p className="col-span-full text-center py-10 text-gray-500">No products match the current filters.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.filter(product => product && product.id).map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}

              {hasMoreToLoad && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => dispatch(loadMore())}
                    className="bg-white border-black border text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition-all font-medium"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;