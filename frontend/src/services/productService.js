import api from './api';

// Fallback luxury catalog in case API is connecting/offline
export const DEMO_PRODUCTS = [
  {
    _id: 'prod_1',
    title: 'Aura Velvet Midnight Evening Gown',
    brand: 'StyleHub Atelier',
    description: 'Handcrafted floor-length luxury velvet evening gown with delicate crystal bead embellishments and an elegant flowing train.',
    price: 18500,
    discountedPrice: 14999,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Midnight Navy', hexCode: '#0f172a' },
      { name: 'Emerald Velvet', hexCode: '#064e3b' },
      { name: 'Royal Onyx', hexCode: '#18181b' },
    ],
    fabric: 'Imported Royal Velvet & Swarovski Crystals',
    stockCount: 15,
    ratings: 4.9,
    numReviews: 28,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    _id: 'prod_2',
    title: 'Celestial Silk Pleated Midi Dress',
    brand: 'StyleHub Paris',
    description: 'Midi-length silk silhouette featuring sculptural cowl neckline and a softly pleated bodice, tailored for high-end celebrations.',
    price: 12900,
    discountedPrice: 9999,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Champagne Gold', hexCode: '#fef08a' },
      { name: 'Rose Quartz', hexCode: '#f43f5e' },
      { name: 'Pearl Ivory', hexCode: '#f8fafc' },
    ],
    fabric: '100% Mulberry Satin Silk',
    stockCount: 20,
    ratings: 4.8,
    numReviews: 19,
    isNewArrival: true,
    isFeatured: true,
  },
  {
    _id: 'prod_3',
    title: 'Chantilly Lace Corset Top',
    brand: 'StyleHub Modern',
    description: 'Bespoke boned corset top featuring French Chantilly lace overlays and satin ribbon back closure. Perfect for evening styling.',
    price: 6499,
    discountedPrice: 4999,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Warm Beige', hexCode: '#E9E1D6' },
      { name: 'Charcoal Black', hexCode: '#29251F' },
    ],
    fabric: 'French Lace & Italian Silk Crepe',
    stockCount: 25,
    ratings: 4.7,
    numReviews: 14,
    isTrending: true,
  },
  {
    _id: 'prod_4',
    title: 'High-Rise Sculpt Wide-Leg Trousers',
    brand: 'StyleHub Luxe',
    description: 'Tailored premium Japanese denim with deep indigo wash, high-rise silhouette and contrast ecru topstitching.',
    price: 7999,
    discountedPrice: 5999,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Raw Indigo', hexCode: '#1e3a8a' },
      { name: 'Off-White Ecru', hexCode: '#FAF9F6' },
    ],
    fabric: '100% Organic Selvedge Cotton Denim',
    stockCount: 18,
    ratings: 4.8,
    numReviews: 32,
    isFeatured: true,
  },
  {
    _id: 'prod_5',
    title: 'Varanasi Zari Heritage Silk Saree',
    brand: 'StyleHub Heritage',
    description: 'Authentic handloom Banarasi Katan silk saree woven with antique gold zari bootis and an ornate grand pallu.',
    price: 32000,
    discountedPrice: 26500,
    category: 'Sarees',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['Free Size'],
    colors: [
      { name: 'Royal Crimson', hexCode: '#881337' },
      { name: 'Mustard Gold', hexCode: '#ca8a04' },
      { name: 'Peacock Teal', hexCode: '#0f766e' },
    ],
    fabric: 'Pure Mulberry Katan Silk & Real Zari',
    stockCount: 8,
    ratings: 5.0,
    numReviews: 42,
    isBestSeller: true,
    isFeatured: true,
  },
  {
    _id: 'prod_6',
    title: 'Kashmiri Tilla Embroidered Anarkali Kurti',
    brand: 'StyleHub Ethnic',
    description: 'Flared silk georgette Kurti embellished with artisanal Kashmiri gold tilla needlework along the neckline and cuffs.',
    price: 14500,
    discountedPrice: 11999,
    category: 'Kurtis',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Soft Gold', hexCode: '#A68B66' },
      { name: 'Sage Green', hexCode: '#15803d' },
      { name: 'Midnight Charcoal', hexCode: '#29251F' },
    ],
    fabric: 'Viscose Georgette with Pure Santoon Lining',
    stockCount: 14,
    ratings: 4.9,
    numReviews: 21,
    isTrending: true,
  },
  {
    _id: 'prod_7',
    title: 'Tailored Structured Double-Breasted Blazer',
    brand: 'StyleHub Modern',
    description: 'Sharply tailored blazer crafted from tropical Italian wool with peaked lapels and horn buttons. Contemporary power dressing.',
    price: 16900,
    discountedPrice: 13500,
    category: 'Western Wear',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Warm Beige', hexCode: '#E9E1D6' },
      { name: 'Charcoal Black', hexCode: '#29251F' },
    ],
    fabric: 'Super 120s Italian Virgin Wool Blend',
    stockCount: 16,
    ratings: 4.9,
    numReviews: 25,
    isFeatured: true,
    isNewArrival: true,
  },
  {
    _id: 'prod_8',
    title: 'Artisan Quilted Leather Shoulder Bag',
    brand: 'StyleHub Accessories',
    description: 'Supple Italian lambskin leather with geometric quilting, convertible gold chain strap, and signature brushed gold clasp.',
    price: 11500,
    discountedPrice: 8999,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    ],
    sizes: ['Free Size'],
    colors: [
      { name: 'Classic Black', hexCode: '#000000' },
      { name: 'Alabaster White', hexCode: '#ffffff' },
      { name: 'Soft Gold', hexCode: '#A68B66' },
    ],
    fabric: 'Full-Grain Nappa Leather & 24k Gold-Toned Hardware',
    stockCount: 22,
    ratings: 5.0,
    numReviews: 37,
    isBestSeller: true,
  },
];

export const productService = {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data.data.products;
    } catch (error) {
      console.warn('API unavailable, serving demo catalog', error.message);
      let list = [...DEMO_PRODUCTS];
      if (params.category && params.category !== 'All') {
        list = list.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params.keyword) {
        list = list.filter((p) => p.title.toLowerCase().includes(params.keyword.toLowerCase()));
      }
      if (params.size) {
        list = list.filter((p) => p.sizes.includes(params.size));
      }
      return list;
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      const found = DEMO_PRODUCTS.find((p) => p._id === id);
      if (found) return found;
      throw error;
    }
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async seedProducts() {
    const response = await api.post('/products/seed');
    return response.data;
  },

  async addReview(id, reviewData) {
    const response = await api.post(`/products/${id}/reviews`, reviewData);
    return response.data;
  },
};
