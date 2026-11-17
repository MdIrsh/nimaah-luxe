import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Seed Users (Admin & Patron)
    const adminExists = await User.findOne({ email: 'admin@nimaahluxe.com' });
    if (!adminExists) {
      await User.create({
        name: "Ni'maah Luxe Admin",
        email: 'admin@nimaahluxe.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✓ Admin user created (admin@nimaahluxe.com / admin123)');
    }

    const customerExists = await User.findOne({ email: 'customer@nimaahluxe.com' });
    if (!customerExists) {
      await User.create({
        name: 'Aisha Al-Mansoor',
        email: 'customer@nimaahluxe.com',
        password: 'customer123',
        role: 'customer',
        addresses: [
          {
            fullName: 'Aisha Al-Mansoor',
            phone: '+91 8618621612',
            street: '14 Royal Crescent, Boat Club Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600028',
            country: 'India',
            isDefault: true,
          },
        ],
      });
      console.log('✓ Customer user created (customer@nimaahluxe.com / customer123)');
    }

    // Seed Luxury Dress & Fashion Catalog
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleCatalog = [
        {
          title: 'Aura Velvet Midnight Evening Gown',
          brand: "Ni'maah Luxe Atelier",
          description:
            'Handcrafted floor-length luxury velvet evening gown with delicate crystal bead embellishments and an elegant flowing train.',
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
          title: 'Celestial Silk Pleated Midi Dress',
          brand: "Ni'maah Luxe Paris",
          description:
            'Midi-length silk silhouette featuring sculptural cowl neckline and a softly pleated bodice, tailored for high-end celebrations.',
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
        },
        {
          title: 'Chantilly Lace Corset Top',
          brand: "Ni'maah Luxe Modern",
          description:
            'Bespoke boned corset top featuring French Chantilly lace overlays and satin ribbon back closure.',
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
          title: 'Varanasi Zari Heritage Silk Saree',
          brand: "Ni'maah Luxe Heritage",
          description:
            'Authentic handloom Banarasi Katan silk saree woven with antique gold zari bootis and an ornate grand pallu.',
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
          title: 'Kashmiri Tilla Embroidered Anarkali Kurti',
          brand: "Ni'maah Luxe Ethnic",
          description:
            'Flared silk georgette Kurti embellished with artisanal Kashmiri gold tilla needlework along the neckline and cuffs.',
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
          title: 'Tailored Structured Double-Breasted Blazer',
          brand: "Ni'maah Luxe Modern",
          description:
            'Sharply tailored blazer crafted from tropical Italian wool with peaked lapels and horn buttons.',
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
          title: 'Artisan Quilted Leather Shoulder Bag',
          brand: "Ni'maah Luxe Accessories",
          description:
            'Supple Italian lambskin leather with geometric quilting, convertible gold chain strap, and signature brushed gold clasp.',
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

      await Product.insertMany(sampleCatalog);
      console.log(`✓ Seeded ${sampleCatalog.length} Ni'maah Luxe products into MongoDB Atlas!`);
    } else {
      console.log(`ℹ Catalog already has ${productCount} products.`);
    }

    console.log('✓ MongoDB Atlas seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
