import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('stylehub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('stylehub_wishlist');
      return saved ? JSON.parse(saved) : [];
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

  // Add dress/item to cart with chosen size & color
  const addToCart = (product, size = 'M', color = null, quantity = 1) => {
    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Default';
    const cartItemId = `${product._id}-${size}-${selectedColor}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
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
            price: product.discountedPrice || product.price,
          },
        ];
      }
    });
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

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Wishlist actions
  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item._id === product._id)) {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  const moveToCart = (product, size = 'M', color = null) => {
    addToCart(product, size, color, 1);
    removeFromWishlist(product._id);
  };

  // Apply Coupon
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
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
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
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
        removeFromCart,
        updateQuantity,
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
