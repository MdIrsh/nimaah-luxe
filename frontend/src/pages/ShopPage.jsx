import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService, DEMO_PRODUCTS } from '../services/productService';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchKeyword, setSearchKeyword] = useState(searchParam);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState(sortParam);

  const categories = [
    'All',
    'Dresses',
    'Tops',
    'Jeans',
    'Sarees',
    'Kurtis',
    'Western Wear',
    'Ethnic Wear',
    'Accessories',
  ];

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { label: 'All', hex: 'transparent' },
    { label: 'Black', hex: '#000000' },
    { label: 'Beige', hex: '#E9E1D6' },
    { label: 'Gold', hex: '#C5A059' },
    { label: 'Navy', hex: '#0f172a' },
    { label: 'Rose', hex: '#f43f5e' },
    { label: 'Ivory', hex: '#FAF9F6' },
  ];

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchKeyword(searchParam);
  }, [categoryParam, searchParam]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error in ShopPage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        if (
          searchKeyword.trim() &&
          !item.title.toLowerCase().includes(searchKeyword.toLowerCase()) &&
          !item.category.toLowerCase().includes(searchKeyword.toLowerCase())
        ) {
          return false;
        }
        if (selectedSize !== 'All' && (!item.sizes || !item.sizes.includes(selectedSize))) {
          return false;
        }
        if (selectedColor !== 'All') {
          const matchColor = item.colors?.some((c) =>
            c.name.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!matchColor) return false;
        }
        const effectivePrice = item.discountedPrice || item.price;
        if (effectivePrice > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountedPrice || a.price;
        const priceB = b.discountedPrice || b.price;
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
        if (sortBy === 'popular') return (b.numReviews || 0) - (a.numReviews || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, searchKeyword, selectedSize, selectedColor, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchKeyword('');
    setSelectedSize('All');
    setSelectedColor('All');
    setMaxPrice(50000);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Editorial Header */}
      <div className="border-b border-[#E9E1D6] pb-8 mb-10">
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-cinzel font-semibold">
          Ni'maah Luxe Collection
        </span>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#29251F] mt-1.5">
          {selectedCategory === 'All' ? "Women's Haute Wardrobe" : selectedCategory}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xl font-light leading-relaxed">
          Divinely inspired silhouettes, handloom banarasi weaves, and bespoke tailoring crafted to elevate your royal aura.
        </p>
      </div>

      {/* Control Bar: Mobile Filter, Results Counter, Search & Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-10 bg-white border border-[#E9E1D6] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-[#29251F] text-white text-xs uppercase tracking-wider font-semibold"
          >
            <SlidersHorizontal size={14} />
            <span>Refine Filters</span>
          </button>
          <span className="text-xs text-gray-600 font-medium">
            Displaying <strong className="text-[#29251F]">{filteredProducts.length}</strong> creations
          </span>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-[#A68B66]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search silhouettes..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66]"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 whitespace-nowrap hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-[#E9E1D6] py-2 px-3 focus:outline-none focus:border-[#A68B66] text-[#29251F] font-medium"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Coveted</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Desktop Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Desktop Filter Sidebar with generous right padding & border */}
        <div className="hidden lg:block lg:col-span-1 space-y-9 pr-8 border-r border-[#E9E1D6]">
          <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-3.5">
            <h3 className="text-xs uppercase tracking-[0.25em] font-cinzel font-semibold text-[#29251F]">
              Filter By
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[#A68B66] hover:underline flex items-center space-x-1"
            >
              <RotateCcw size={12} />
              <span>Reset All</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#29251F] mb-3.5 font-cinzel">
              Categories
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left text-xs py-1.5 transition ${
                    selectedCategory === cat
                      ? 'text-[#C5A059] font-bold pl-2 border-l-2 border-[#C5A059]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#29251F] mb-3.5 font-cinzel">
              Sizing Selection
            </h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 text-xs border font-medium transition ${
                    selectedSize === sz
                      ? 'bg-[#29251F] text-white border-[#29251F]'
                      : 'bg-white border-[#E9E1D6] text-gray-700 hover:border-[#A68B66]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#29251F] mb-3.5 font-cinzel">
              Royal Palette
            </h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setSelectedColor(c.label)}
                  className={`px-3 py-1.5 text-xs border flex items-center space-x-2 transition ${
                    selectedColor === c.label
                      ? 'border-[#29251F] bg-[#FAF9F6] font-semibold text-[#29251F]'
                      : 'border-[#E9E1D6] bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c.hex !== 'transparent' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.hex }}
                    />
                  )}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#29251F] font-cinzel">
                Price Ceiling
              </h4>
              <span className="text-xs font-serif-luxury text-[#C5A059] font-bold">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="3000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C5A059] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹3,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid with Balanced Gap */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E9E1D6] p-16 sm:p-20 text-center space-y-5 shadow-xs">
              <span className="text-3xl font-serif-luxury text-[#A68B66] block">No Creations Found</span>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                No designs currently match your active filters. Try adjusting your parameters or resetting to view the full wardrobe.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-8 py-3 bg-[#29251F] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#A68B66] transition shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 sm:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
