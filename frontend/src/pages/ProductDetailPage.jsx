import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { productService, DEMO_PRODUCTS } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isWishlisted, addToWishlist, removeFromWishlist } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].name);
        }

        const all = await productService.getProducts();
        const related = all.filter((p) => p._id !== data._id && p.category === data.category).slice(0, 3);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-serif-luxury text-xl text-[#29251F]">Curating Ni'maah Luxe Piece...</p>
        </div>
      </div>
    );
  }

  const isFavorited = isWishlisted(product._id);
  const discountPercent =
    product.discountedPrice && product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await productService.addReview(product._id, {
        rating: newRating,
        comment: newComment,
      });
    } catch {}

    const updatedReviews = [
      ...(product.reviews || []),
      {
        _id: 'rev_' + Date.now(),
        name: user?.name || 'Patron of Ni\'maah Luxe',
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString(),
      },
    ];

    setProduct({
      ...product,
      reviews: updatedReviews,
      numReviews: updatedReviews.length,
    });

    setReviewSubmitted(true);
    setNewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Breadcrumb with Crisp Margins */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 uppercase tracking-[0.2em]">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black">
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#29251F] font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Gallery Thumbnails + Main View */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-5">
          {product.images?.length > 1 && (
            <div className="flex sm:flex-col gap-3.5 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden bg-[#FAF9F6] transition shadow-xs ${
                    selectedImage === img ? 'border-[#C5A059]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 aspect-[3/4] bg-[#FAF9F6] border border-[#E9E1D6] overflow-hidden relative group shadow-sm">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-cover object-top transition duration-700 hover:scale-105 cursor-crosshair"
            />
            {discountPercent && (
              <span className="absolute top-5 left-5 bg-[#29251F] text-[#FAF9F6] text-xs uppercase tracking-[0.25em] font-bold px-3.5 py-1.5 shadow-md">
                -{discountPercent}% Privilege
              </span>
            )}
          </div>
        </div>

        {/* Right Details Column with Symmetrical Spacing */}
        <div className="lg:col-span-5 space-y-7">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
              <Crown size={14} />
              <span>{product.brand || "Ni'maah Luxe Atelier"} • {product.category}</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#29251F] leading-tight font-normal">
              {product.title}
            </h1>

            {/* Rating breakdown */}
            <div className="flex items-center space-x-2.5 pt-1">
              <div className="flex items-center text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.ratings || 4.9) ? '#C5A059' : 'none'}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#29251F]">{product.ratings || 4.9}</span>
              <span className="text-xs text-gray-400 font-light">({product.numReviews || 28} patron reviews)</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-4 border-y border-[#E9E1D6] py-5">
            <span className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-[#29251F]">
              ₹{(product.discountedPrice || product.price).toLocaleString('en-IN')}
            </span>
            {product.discountedPrice && product.discountedPrice < product.price && (
              <span className="text-base text-gray-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[11px] text-[#A68B66] uppercase tracking-wider font-semibold ml-auto">
              Inclusive of luxury GST
            </span>
          </div>

          {/* Color Palette Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.18em] font-semibold text-[#29251F]">
                  Color: <span className="font-normal text-[#A68B66]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center space-x-3.5">
                {product.colors.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(col.name)}
                    className={`p-1 rounded-full border-2 transition ${
                      selectedColor === col.name ? 'border-[#29251F]' : 'border-transparent hover:border-gray-300'
                    }`}
                    title={col.name}
                  >
                    <span
                      className="block w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: col.hexCode }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector with Exact Padding */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-[0.18em] font-semibold text-[#29251F]">
                Size: <span className="font-normal text-[#A68B66]">{selectedSize}</span>
              </span>
              <a href="#size-guide" className="text-[11px] text-[#A68B66] underline uppercase tracking-wider">
                Bespoke Sizing Chart
              </a>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-14 py-2.5 px-3.5 text-xs uppercase tracking-widest font-semibold border transition ${
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

          {/* Quantity & Stock Indicator */}
          <div className="flex items-center space-x-7 pt-1">
            <div className="flex items-center border border-[#E9E1D6] bg-white shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-sm hover:bg-[#FAF9F6] transition font-bold"
              >
                -
              </button>
              <span className="px-5 py-2.5 text-xs font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-sm hover:bg-[#FAF9F6] transition font-bold"
              >
                +
              </button>
            </div>

            <div className="text-xs">
              {product.stockCount > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                  <Check size={14} />
                  <span>Atelier In Stock ({product.stockCount} pieces available)</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Bespoke Tailoring on Pre-order</span>
              )}
            </div>
          </div>

          {/* CTAs with Generous Heights & Padding */}
          <div className="space-y-3.5 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2.5 shadow-md"
              >
                <ShoppingBag size={16} />
                <span>{addedSuccess ? 'Added to Bag ✓' : 'Add To Bag'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-4.5 bg-[#E9E1D6] hover:bg-[#d8cebf] text-[#29251F] text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 shadow-xs"
              >
                <span>Acquire Now</span>
              </button>
            </div>

            <button
              onClick={() => (isFavorited ? removeFromWishlist(product._id) : addToWishlist(product))}
              className="w-full py-3.5 bg-white border border-[#E9E1D6] hover:border-[#A68B66] text-[#29251F] text-xs uppercase tracking-[0.2em] transition flex items-center justify-center space-x-2 shadow-xs font-medium"
            >
              <Heart size={16} fill={isFavorited ? '#C5A059' : 'none'} color={isFavorited ? '#C5A059' : '#29251F'} />
              <span>{isFavorited ? 'Saved in Private Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="border-t border-[#E9E1D6] pt-7 space-y-3.5 text-xs text-gray-600 font-light">
            <div className="flex items-center space-x-3.5">
              <Truck size={17} className="text-[#C5A059]" />
              <span>White-Glove Expedited Delivery in 2–4 Business Days</span>
            </div>
            <div className="flex items-center space-x-3.5">
              <RefreshCw size={17} className="text-[#C5A059]" />
              <span>Complimentary 14-Day Alterations & Exchanges</span>
            </div>
            <div className="flex items-center space-x-3.5">
              <ShieldCheck size={17} className="text-[#C5A059]" />
              <span>100% Authentic Handloom Silk & Real Zari Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Details with Clear Spacing */}
      <div className="border-t border-[#E9E1D6] pt-14">
        <div className="flex space-x-10 border-b border-[#E9E1D6] pb-4">
          {['description', 'fabric', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs uppercase tracking-[0.22em] font-semibold transition pb-3 relative font-cinzel ${
                activeTab === tab ? 'text-[#29251F]' : 'text-gray-400 hover:text-black'
              }`}
            >
              {tab === 'description' && 'Creation Story'}
              {tab === 'fabric' && 'Fabric & Preservation'}
              {tab === 'reviews' && `Patron Reviews (${product.reviews?.length || product.numReviews || 0})`}
              {activeTab === tab && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C5A059]"></span>
              )}
            </button>
          ))}
        </div>

        <div className="py-10">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-sm text-gray-700 leading-relaxed font-light">
              <p>{product.description}</p>
              <p>
                Each silhouette from Ni'maah Luxe is crafted to balance royal modesty and contemporary elegance. Tailored with an internal boned support structure and flowing drapery for flawless poise on life's most memorable stages.
              </p>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="max-w-2xl space-y-4 text-xs text-gray-700 font-light leading-relaxed">
              <p><strong className="text-[#29251F] font-semibold">Fabric Composition:</strong> {product.fabric || 'Pure Mulberry Silk & Korean Organza'}</p>
              <p><strong className="text-[#29251F] font-semibold">Artisanal Weave:</strong> Hand-guided Zari needlework / Banarasi jacquard</p>
              <p><strong className="text-[#29251F] font-semibold">Care:</strong> Specialized dry clean only. Wrap in breathable unbleached muslin cloth.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-10 max-w-3xl">
              <div className="space-y-4">
                {(product.reviews && product.reviews.length > 0) ? (
                  product.reviews.map((rev, idx) => (
                    <div key={idx} className="bg-white p-6 border border-[#E9E1D6] shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#29251F]">{rev.name}</span>
                        <div className="flex text-[#C5A059]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < rev.rating ? '#C5A059' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-light">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 font-light">Be the first patron to share an impression of this piece.</p>
                )}
              </div>

              {/* Add Review Box */}
              <div className="bg-white p-8 border border-[#E9E1D6] space-y-5 shadow-xs">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#29251F] font-cinzel">
                  Write a Patron Review
                </h4>
                {reviewSubmitted ? (
                  <p className="text-xs text-emerald-700 font-medium">Thank you. Your review has been recorded.</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1 font-medium">
                        Your Rating
                      </label>
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="text-xs bg-[#FAF9F6] border border-[#E9E1D6] p-2.5 font-medium"
                      >
                        <option value={5}>5 Stars - Pure Sovereign Perfection</option>
                        <option value={4}>4 Stars - Exceptional Quality</option>
                        <option value={3}>3 Stars - Good Fit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1 font-medium">
                        Your Impression
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Detail your experience with the drape, stitching, and royal presence..."
                        className="w-full text-xs bg-[#FAF9F6] border border-[#E9E1D6] p-3.5 focus:outline-none focus:border-[#C5A059]"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="px-7 py-3 bg-[#29251F] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A059] transition shadow-xs"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#E9E1D6] pt-16 mt-16">
          <div className="mb-10 space-y-1">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-cinzel font-semibold">
              Complete The Look
            </span>
            <h2 className="font-serif-luxury text-3xl text-[#29251F]">Related Silhouettes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
