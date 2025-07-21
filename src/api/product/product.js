import { BASE_URL } from '../../constants/index';

export async function fetchAllProducts({ category = [], minPrice = 0, maxPrice = 10000 } = {}) {
    let allProducts = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;
  
    while (hasMore) {
      const data = await getProducts({ limit, page, category, minPrice, maxPrice });
      const products = data.products || [];
  
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts = allProducts.concat(products);
        page++;
      }
    }
  
    return { products: allProducts };
  }

  export async function fetchProductById(productId) {
    try {
        const response = await fetch(`${BASE_URL}/products/${productId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Failed to fetch product ${productId}`);
        return data;
    } catch (err) {
        console.error('API Error (fetchProductById):', err);
        throw err;
    }
}
  
export async function getProducts({
  limit = 10,
  page = 1,
  category = [],
  minPrice = 0,
  maxPrice = 10000,
} = {}) {
  try {
    const categoryParam = category.join(',')
    const query = new URLSearchParams({
      limit,
      page,
      category: categoryParam,
      minPrice,
      maxPrice,
    })

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`)

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.error('Error fetching products:', err)
    throw err;
  }
}
