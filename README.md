# StyleHub – Premium Women's Fashion E-Commerce Website

A production-grade, full-stack luxury fashion and dress boutique e-commerce web platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), **Tailwind CSS**, and **Lucide Icons**.

---

## 1. Project Directory Architecture

```text
stylehub/
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProductCard.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ShopPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── WishlistPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── layouts/
│       │   ├── MainLayout.jsx
│       │   ├── AdminLayout.jsx
│       │   └── CustomerLayout.jsx
│       ├── admin/
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminProducts.jsx
│       │   └── AdminOrders.jsx
│       ├── customer/
│       │   ├── CustomerProfile.jsx
│       │   └── CustomerOrders.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── productService.js
│       │   └── orderService.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useCart.js
│       │   └── useWishlist.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Order.js
│       │   └── Category.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productController.js
│       │   ├── orderController.js
│       │   └── userController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── productRoutes.js
│       │   ├── orderRoutes.js
│       │   └── userRoutes.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── errorMiddleware.js
│       ├── services/
│       │   ├── paymentService.js
│       │   └── emailService.js
│       ├── utils/
│       │   ├── generateToken.js
│       │   └── apiResponse.js
│       └── server.js
│
└── README.md
```

---

## 2. Luxury Design System

- **Primary Color:** Pure White (`#FFFFFF`)
- **Secondary Color:** Warm Beige (`#E9E1D6`)
- **Dark Neutral:** Charcoal (`#29251F`)
- **Accent Color:** Soft Gold (`#A68B66`)
- **Background Canvas:** Off-White (`#FAF9F6`)
- **Typography:** Didot / Bodoni / Serif luxury headers paired with clean modern sans-serif body.

---

## 3. Implemented Flowchart Pipeline

```
[1. Customer opens website]
            ↓
[2. Browse Dress Collection] (Dresses, Sarees, Kurtis, Tops, Western Wear, Accessories)
            ↓
[3. Select Dress] (Product Detail Page with high-res editorial zoom)
            ↓
[4. Choose Size and Color] (XS, S, M, L, XL, XXL & custom color palettes)
            ↓
[5. Add to Cart / Wishlist] (Dynamic bag badge, live totals)
            ↓
[6. Checkout] (Address entry, delivery selection, coupon discounts)
            ↓
[7. Enter Address] (Sanctuary delivery details)
            ↓
[8. Make Payment] (Card, UPI / QR, Net Banking)
            ↓
[9. Payment Verification] (PCI-DSS tokenization & signature verification)
            ↓
[10. Create Order] (Order generated & recorded in database)
            ↓
[11. Admin Receives Order] (Admin Dashboard notified, inventory updated)
            ↓
[12. Process and Ship] (Atelier tailoring -> Shipped with live BlueDart tracking number)
            ↓
[13. Customer Receives Dress] (Customer portal status updated to Delivered)
```

---

## 4. Getting Started & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local daemon or MongoDB Atlas URI)

### Quick Start: Backend
```bash
cd backend
npm install
# Set MONGO_URI in .env (defaults to mongodb://localhost:27017/nimaah_luxe)
npm run dev
```
*Backend runs on: `http://localhost:5000`*

### Quick Start: Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 5. Instant Test Credentials

- **Customer Patron Demo:**
  - Email: `customer@stylehub.com`
  - Password: `customer123`
  - Access: Browse, Cart, Wishlist, Checkout, Order Tracker, Profile

- **Store Administrator Demo:**
  - Email: `admin@stylehub.com`
  - Password: `admin123`
  - Access: Admin Overview Dashboard, Dress & Product Management, Order Fulfillment Pipeline

*(You can also use the **"View as: ADMIN / CUSTOMER"** quick switch button in the top announcement bar for instantaneous previewing).*
