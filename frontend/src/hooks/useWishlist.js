import { useCart } from '../context/CartContext';

export const useWishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist, isWishlisted, moveToCart } = useCart();
  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    moveToCart,
    count: wishlist.length,
  };
};

export default useWishlist;
