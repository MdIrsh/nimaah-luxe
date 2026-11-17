import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

export const WishlistPage = () => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-[#E9E1D6]/40 rounded-full flex items-center justify-center mx-auto text-[#A68B66]">
          <Heart size={32} />
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F]">Your Private Wishlist Is Empty</h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Save your favourite dresses, evening gowns, and artisanal creations to acquire them whenever you desire.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-block px-8 py-4 bg-[#29251F] text-white hover:bg-[#A68B66] text-xs uppercase tracking-[0.2em] font-semibold transition"
          >
            Explore Haute Couture
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-[#E9E1D6] pb-6 mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
          Saved Creations
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#29251F] mt-1">
          Private Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const image =
            product.images?.[0] ||
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80';

          return (
            <div key={product._id} className="bg-white border border-[#E9E1D6] flex flex-col justify-between group">
              <div className="relative aspect-[3/4] bg-[#FAF9F6] overflow-hidden">
                <img
                  src={image}
                  alt={product.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-gray-500 hover:text-red-600 rounded-full shadow"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A68B66] font-semibold">
                    {product.category}
                  </span>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-serif-luxury text-base text-[#29251F] line-clamp-1 hover:text-[#A68B66]">
                      {product.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="font-serif-luxury text-base font-semibold text-[#29251F]">
                    ₹{(product.discountedPrice || product.price).toLocaleString('en-IN')}
                  </span>
                  {product.discountedPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => moveToCart(product, product.sizes?.[0] || 'M')}
                  className="w-full py-2.5 bg-[#29251F] hover:bg-[#A68B66] text-white text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={14} />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
