import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('stylehub_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => {
        const prod = item.product;
        if (prod) {
          const orig = Number(prod.price || 0);
          const disc = Number(prod.discountedPrice || 0);
          const effective = (disc > 0 && orig > 0 && disc < orig) ? disc : (orig > 0 ? orig : disc);
          if (effective > 0) {
            return { ...item, price: effective };
          }
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('stylehub_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    localStorage.setItem('stylehub_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('stylehub_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Helper to safely get the true active selling price
  const getProductPrice = (product) => {
    if (!product) return 0;
    const orig = Number(product.price || 0);
    const disc = Number(product.discountedPrice || 0);
    if (disc > 0 && orig > 0 && disc < orig) {
      return disc;
    }
    return orig > 0 ? orig : disc;
  };

  // Add dress/item to cart with chosen size & color
  const addToCart = (product, size = 'M', color = null, quantity = 1) => {
    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Default';
    const cartItemId = `${product._id}-${size}-${selectedColor}`;
    const effectivePrice = getProductPrice(product);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].price = effectivePrice;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            product,
            size,
            color: selectedColor,
            quantity,
            price: effectivePrice,
          },
        ];
      }
    });
  };

  // Direct Buy Now: sets the cart to ONLY this 1 item for express direct checkout
  const buyNow = (product, size = 'M', color = null, quantity = 1) => {
    if (!product) return;
    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Default';
    const cartItemId = `${product._id}-${size}-${selectedColor}`;
    const effectivePrice = getProductPrice(product);

    const singleItem = {
      cartItemId,
      product,
      size,
      color: selectedColor,
      quantity,
      price: effectivePrice,
    };
    setCart([singleItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const updateItemSize = (cartItemId, newSize) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        const newCartItemId = `${item.product._id}-${newSize}-${item.color}`;
        return { ...item, size: newSize, cartItemId: newCartItemId };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Wishlist actions
  const addToWishlist = (product) => {
    if (!product || !product._id) return;
    setWishlist((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (!list.some((item) => item && (item._id === product._id || item.id === product._id))) {
        return [...list, product];
      }
      return list;
    });
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.filter((item) => item && item._id !== productId && item.id !== productId);
    });
  };

  const isWishlisted = (productId) => {
    if (!productId || !Array.isArray(wishlist)) return false;
    return wishlist.some((item) => item && (item._id === productId || item.id === productId));
  };

  const moveToCart = (product, size = 'M', color = null) => {
    if (!product) return;
    addToCart(product, size, color, 1);
    removeFromWishlist(product._id);
  };

  // Apply Coupon
  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'LUXE15') {
      setCoupon({ code: 'LUXE15', discountPercent: 15 });
      setCouponError('');
      return true;
    } else if (cleanCode === 'STYLEHUB20') {
      setCoupon({ code: 'STYLEHUB20', discountPercent: 20 });
      setCouponError('');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try LUXE15 or STYLEHUB20');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  // Calculations
  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotal = safeCart.reduce((acc, item) => acc + (Number(item?.price || 0) * Number(item?.quantity || 1)), 0);
  const itemsCount = safeCart.reduce((acc, item) => acc + Number(item?.quantity || 1), 0);
  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const shippingFee = subtotal > 15000 || subtotal === 0 ? 0 : 499; // Free shipping above 15,000
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.05); // 5% luxury apparel GST
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        itemsCount,
        subtotal,
        discountAmount,
        shippingFee,
        estimatedTax,
        grandTotal,
        coupon,
        couponError,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        updateItemSize,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        moveToCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
