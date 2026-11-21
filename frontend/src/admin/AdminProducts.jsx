import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Star,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { productService, DEMO_PRODUCTS } from '../services/productService';
import uploadService, { formatFileSize } from '../services/uploadService';
import { getProductImageUrl, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

// Helper to extract clean direct image URL from Google Images search or redirect links
export const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // If user pasted a Google Images search result link:
  // e.g. https://www.google.com/imgres?q=...&imgurl=https%3A%2F%2F...
  if (trimmed.includes('google.') && (trimmed.includes('/imgres') || trimmed.includes('imgurl='))) {
    try {
      const parsed = new URL(trimmed);
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    } catch { }
  }

  // Handle Google redirect URLs: https://www.google.com/url?url=https%3A%2F%2F...
  if (trimmed.includes('google.') && (trimmed.includes('/url?') || trimmed.includes('url='))) {
    try {
      const parsed = new URL(trimmed);
      const targetUrl = parsed.searchParams.get('url') || parsed.searchParams.get('q');
      if (targetUrl) return decodeURIComponent(targetUrl);
    } catch { }
  }

  return trimmed;
};

export const AdminProducts = () => {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleMultipleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''} to Cloudinary...`);

    try {
      const uploadedUrls = await uploadService.uploadMultipleImages(files, (pct) => {
        setUploadProgress(pct);
      });

      if (uploadedUrls && uploadedUrls.length > 0) {
        setForm((prev) => {
          const current = (prev.images || []).filter(
            (img) => img && !img.includes('unsplash.com')
          );
          return {
            ...prev,
            images: [...current, ...uploadedUrls],
          };
        });
        setUploadProgress(100);
        setUploadStatusText(`${uploadedUrls.length} photo(s) added successfully!`);
      }
    } catch (err) {
      console.error('Multiple upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Existing images preserved.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadStatusText(''), 3500);
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const cleaned = cleanImageUrl(urlInput.trim());
    setForm((prev) => {
      const current = (prev.images || []).filter(
        (img) => img && img !== FALLBACK_PRODUCT_IMAGE
      );
      return {
        ...prev,
        images: [...current, cleaned],
      };
    });
    setUrlInput('');
  };

  const handleSetMainImage = (index) => {
    if (index === 0) return;
    setForm((prev) => {
      const images = [...(prev.images || [])];
      const [selected] = images.splice(index, 1);
      return {
        ...prev,
        images: [selected, ...images],
      };
    });
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => {
      const images = (prev.images || []).filter((_, idx) => idx !== index);
      return {
        ...prev,
        images,
      };
    });
  };

  // Wireframe state structure matching user request
  const [form, setForm] = useState({
    title: '',
    brand: "Ni'maah Luxe",
    category: 'Kurtis',
    sku: 'KUR-001',
    description: '',
    price: 15000,
    discountedPrice: 12999,
    discountPercent: 13,
    stockCount: 15,
    minStock: 5,
    stockStatus: 'In Stock',
    color: 'Red',
    size: 'M',
    sizes: ['M'],
    fabric: 'Pure Mulberry Silk',
    images: [],
  });

  const categories = [
    'Kurtis',
    'Dresses',
    'Ethnic Wear',
    'Sarees',
    'Tops',
    'Jeans',
    'Western Wear',
    'Accessories',
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      if (data && data.length > 0) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setSaveError('');
    setUploadError('');
    setForm({
      title: '',
      brand: "Ni'maah Luxe",
      category: 'Kurtis',
      sku: `KUR-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      price: 15000,
      discountedPrice: 12999,
      discountPercent: 13,
      stockCount: 15,
      minStock: 5,
      stockStatus: 'In Stock',
      color: 'Red',
      size: 'M',
      sizes: ['M'],
      fabric: 'Pure Mulberry Silk',
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p._id);
    setSaveError('');
    setUploadError('');
    const validImgs = (p.images || []).filter(
      (img) => img && typeof img === 'string' && !img.includes('unsplash.com')
    );
    const origPrice = Number(p.price || 0);
    const salePrice = Number(p.discountedPrice ?? p.price ?? 0);
    const disc = origPrice > 0 && salePrice < origPrice
      ? Math.round(((origPrice - salePrice) / origPrice) * 100)
      : (p.discountPercent || 0);

    const firstColor = Array.isArray(p.colors) && p.colors.length > 0
      ? (typeof p.colors[0] === 'string' ? p.colors[0] : p.colors[0]?.name || 'Red')
      : (p.color || 'Red');

    const firstSize = Array.isArray(p.sizes) && p.sizes.length > 0
      ? p.sizes[0]
      : (p.size || 'M');

    setForm({
      title: p.title || '',
      brand: p.brand || "Ni'maah Luxe",
      category: p.category || 'Kurtis',
      sku: p.sku || `KUR-${Math.floor(100 + Math.random() * 900)}`,
      description: p.description || '',
      price: origPrice || 15000,
      discountedPrice: salePrice || 12999,
      discountPercent: disc || 13,
      stockCount: Number(p.stockCount ?? 15),
      minStock: Number(p.minStock ?? 5),
      stockStatus: p.stockStatus || (Number(p.stockCount) > 5 ? 'In Stock' : 'Low Stock'),
      color: firstColor,
      size: firstSize,
      sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [firstSize],
      fabric: p.fabric || 'Pure Mulberry Silk',
      images: validImgs,
    });
    setIsModalOpen(true);
  };

  const handleToggleSize = (sz) => {
    let updated;
    if (form.sizes.includes(sz)) {
      updated = form.sizes.filter((s) => s !== sz);
      if (updated.length === 0) updated = [sz];
    } else {
      updated = [...form.sizes, sz];
    }
    setForm({
      ...form,
      sizes: updated,
      size: updated.join(','),
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSaveError('');

    try {
      if (!form.title?.trim()) throw new Error('Product Name is required.');
      if (!form.brand?.trim()) throw new Error('Brand is required.');
      if (!form.category?.trim()) throw new Error('Category is required.');
      if (!form.discountedPrice || Number(form.discountedPrice) <= 0) {
        throw new Error('Please enter a valid Sale Price.');
      }
      if (!form.description?.trim()) {
        throw new Error('Please enter an editorial Description.');
      }

      const cleanImages = (form.images || []).filter(
        (img) => img && typeof img === 'string' && !img.includes('unsplash.com')
      );
      if (cleanImages.length === 0) {
        throw new Error('Please upload at least one authentic product image from your device.');
      }

      const origPrice = Number(form.price || form.discountedPrice);
      const salePrice = Number(form.discountedPrice);
      const disc = origPrice > 0 && salePrice < origPrice
        ? Math.round(((origPrice - salePrice) / origPrice) * 100)
        : Number(form.discountPercent || 0);

      const colorName = form.color?.trim() || 'Red';
      const colorsPayload = [{ name: colorName, hexCode: '#000000' }];

      // Parse sizes safely: split comma-separated values like 'S,XL' into ['S', 'XL']
      let rawSizes = [];
      if (typeof form.size === 'string' && form.size.trim()) {
        rawSizes = form.size.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
      }
      if (rawSizes.length === 0 && Array.isArray(form.sizes)) {
        rawSizes = form.sizes
          .flatMap((s) => (typeof s === 'string' ? s.split(',') : s))
          .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : s))
          .filter(Boolean);
      }
      const sizesPayload = rawSizes.length > 0 ? Array.from(new Set(rawSizes)) : ['M'];

      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        category: form.category,
        sku: form.sku?.trim() || '',
        description: form.description.trim(),
        price: origPrice,
        discountedPrice: salePrice,
        discountPercent: disc,
        stockCount: Number(form.stockCount || 0),
        minStock: Number(form.minStock || 5),
        stockStatus: form.stockStatus || 'In Stock',
        fabric: form.fabric?.trim() || 'Pure Mulberry Silk',
        colors: colorsPayload,
        sizes: sizesPayload,
        images: cleanImages.map(cleanImageUrl),
      };

      if (editingId) {
        const updated = await productService.updateProduct(editingId, payload);
        const resolved = updated?.data || updated || { ...payload, _id: editingId };
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? { ...p, ...resolved } : p))
        );
      } else {
        const created = await productService.createProduct(payload);
        const resolved = created?.data || created;
        if (resolved && resolved._id) {
          setProducts((prev) => [resolved, ...prev]);
        }
      }

      setIsModalOpen(false);
      // Fetch latest database items silently in background
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save product to database';
      setSaveError(msg);
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to retire this piece from the catalog?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
            Catalog & Inventory Management
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#29251F] mt-1">
            Boutique Apparel Inventory
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#29251F] hover:bg-[#A68B66] text-white text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition shadow-md cursor-pointer rounded-xs"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white border border-[#E9E1D6] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-sm shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-3 text-[#A68B66]" />
          <input
            type="text"
            placeholder="Search by title, category, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66] rounded-xs"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total Products in Inventory: <strong className="text-[#29251F] font-bold">{products.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E9E1D6] shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-gray-500 uppercase tracking-wider border-b border-[#E9E1D6]">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Offer</th>
                <th className="py-3.5 px-4">Sizes & Color</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F6]">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-[#FAF9F6]/60 transition">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <div className="relative shrink-0">
                      <img
                        src={getProductImageUrl(p.images?.[0])}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className="w-11 h-14 object-cover object-top border border-[#E9E1D6] rounded-xs bg-[#FAF9F6]"
                      />
                      {p.images && p.images.length > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-[#14110C] text-[#C5A059] border border-[#C5A059]/40 text-[9px] font-bold px-1 rounded shadow-xs" title={`${p.images.length} images total`}>
                          +{p.images.length - 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-serif-luxury text-sm font-semibold text-[#29251F]">{p.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {p.sku && <span className="font-mono text-[#A68B66] font-bold mr-1.5">{p.sku}</span>}
                        {p.brand} • {p.fabric || 'Pure Silk'}
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-[#FAF9F6] text-[#29251F] border border-[#E9E1D6] text-[10px] uppercase font-bold rounded-xs">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-serif-luxury font-bold text-sm text-[#29251F]">
                      ₹{((p.discountedPrice !== undefined ? p.discountedPrice : p.price) || 0).toLocaleString('en-IN')}
                    </span>
                    {p.discountedPrice && p.price && p.discountedPrice < p.price && (
                      <span className="block text-[10px] text-gray-400 line-through">
                        ₹{(p.price || 0).toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.sizes?.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${
                        (p.stockStatus === 'In Stock' || (!p.stockStatus && p.stockCount > 5))
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : (p.stockStatus === 'Out of Stock' || p.stockCount === 0)
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span>{p.stockCount} in stock</span>
                      {p.stockStatus && <span>• {p.stockStatus}</span>}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      <Star size={13} fill="#C5A059" stroke="#C5A059" />
                      <span className="font-bold text-[#14110C] text-xs">
                        {(p.numReviews || p.totalReviews) > 0
                          ? Number(p.averageRating || p.ratings || 0).toFixed(1)
                          : '0.0'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({p.numReviews || p.totalReviews || 0})
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-gray-500 hover:text-[#A68B66] hover:bg-[#FAF9F6] rounded transition cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Retire Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================== */}
      {/* EXACT USER WIREFRAME MODAL: Add / Edit Product                     */}
      {/* ================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-[#E9E1D6] max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Title Bar */}
            <div className="bg-[#FAF9F6] border-b border-[#E9E1D6] px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#29251F] text-[#C5A059] flex items-center justify-center font-bold">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#29251F]">
                    {editingId ? 'Edit Product' : 'Add / Edit Product'}
                  </h3>
                  <p className="text-[11px] text-[#A68B66] font-medium tracking-wide">
                    {editingId ? 'Modify existing inventory creation' : 'Add / Edit inventory details for Ni\'maah Luxe'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E9E1D6] text-gray-500 hover:text-[#29251F] hover:border-[#29251F] flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* ------------------------------------------------------------- */}
              {/* 1. PRODUCT INFORMATION SECTION                                */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-2">
                  <h4 className="font-serif-luxury text-base font-bold text-[#29251F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    Product Information
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">General Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Super Kurta"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="Ni'maah Luxe"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const prefixMap = {
                          Kurtis: 'KUR',
                          Dresses: 'DRS',
                          'Ethnic Wear': 'ETH',
                          Sarees: 'SAR',
                          Tops: 'TOP',
                          Jeans: 'JNS',
                          'Western Wear': 'WST',
                          Accessories: 'ACC',
                        };
                        const pfx = prefixMap[cat] || 'PRD';
                        const currentSuffix = form.sku.includes('-') ? form.sku.split('-')[1] : '001';
                        setForm({
                          ...form,
                          category: cat,
                          sku: `${pfx}-${currentSuffix}`,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-medium text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          ▼ {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                      placeholder="KUR-001"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-mono font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Nice Product Fully Comfortable Kurta..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 2. PRICING SECTION                                            */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-2">
                  <h4 className="font-serif-luxury text-base font-bold text-[#29251F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    Pricing
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Cost & Valuation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => {
                        const orig = Number(e.target.value);
                        const sale = Number(form.discountedPrice);
                        const disc = orig > 0 && sale > 0 && sale < orig
                          ? Math.round(((orig - sale) / orig) * 100)
                          : 0;
                        setForm({ ...form, price: orig, discountPercent: disc });
                      }}
                      placeholder="15000"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Sale Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.discountedPrice}
                      onChange={(e) => {
                        const sale = Number(e.target.value);
                        const orig = Number(form.price);
                        const disc = orig > 0 && sale > 0 && sale < orig
                          ? Math.round(((orig - sale) / orig) * 100)
                          : 0;
                        setForm({ ...form, discountedPrice: sale, discountPercent: disc });
                      }}
                      placeholder="12999"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={form.discountPercent}
                      onChange={(e) => {
                        const disc = Number(e.target.value);
                        const orig = Number(form.price);
                        const sale = orig > 0 && disc > 0
                          ? Math.round(orig * (1 - disc / 100))
                          : form.discountedPrice;
                        setForm({ ...form, discountPercent: disc, discountedPrice: sale });
                      }}
                      placeholder="13"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 3. INVENTORY SECTION                                          */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-2">
                  <h4 className="font-serif-luxury text-base font-bold text-[#29251F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    Inventory
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Stock Logistics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.stockCount}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        const min = Number(form.minStock || 5);
                        let status = 'In Stock';
                        if (qty <= 0) status = 'Out of Stock';
                        else if (qty <= min) status = 'Low Stock';
                        setForm({ ...form, stockCount: qty, stockStatus: status });
                      }}
                      placeholder="15"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Minimum Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.minStock}
                      onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                      placeholder="5"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Stock Status
                    </label>
                    <select
                      value={form.stockStatus}
                      onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer"
                    >
                      <option value="In Stock">▼ In Stock</option>
                      <option value="Low Stock">▼ Low Stock</option>
                      <option value="Out of Stock">▼ Out of Stock</option>
                      <option value="Pre-order">▼ Pre-order</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 4. PRODUCT ATTRIBUTES SECTION                                  */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-2">
                  <h4 className="font-serif-luxury text-base font-bold text-[#29251F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    Product Attributes
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Color, Size & Material</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Color
                    </label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="Red"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Size
                    </label>
                    <input
                      type="text"
                      value={form.size}
                      onChange={(e) => {
                        const s = e.target.value;
                        const parts = s.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
                        setForm({ ...form, size: s, sizes: parts.length > 0 ? parts : [s] });
                      }}
                      placeholder="M or S,XL"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#29251F] mb-1.5">
                      Fabric
                    </label>
                    <input
                      type="text"
                      value={form.fabric}
                      onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                      placeholder="Pure Mulberry Silk"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059] focus:bg-white transition font-medium"
                    />
                  </div>

                  {/* Multi-Select Size Tag Pills */}
                  <div className="sm:col-span-3 pt-1">
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                      Available Size Range:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSizes.map((sz) => {
                        const isSelected = form.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border ${
                              isSelected
                                ? 'bg-[#29251F] text-white border-[#29251F] shadow-xs'
                                : 'bg-[#FAF9F6] border-[#E9E1D6] text-gray-600 hover:border-[#C5A059]'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 5. PRODUCT IMAGES SECTION                                     */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-2">
                  <h4 className="font-serif-luxury text-base font-bold text-[#29251F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    Product Images
                  </h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {(form.images || []).length} Photo{(form.images || []).length !== 1 ? 's' : ''} Attached
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Prominent [+ Upload Image] Button matching wireframe */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      id="admin-inventory-image-upload"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleMultipleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-inventory-image-upload"
                      className={`px-6 py-3 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm transition shrink-0 ${
                        isUploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload size={15} className="text-[#C5A059]" />
                      <span>+ Upload Image</span>
                    </label>

                    {/* Paste URL Option */}
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        placeholder="Or paste direct image URL here..."
                        className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-4 py-2.5 bg-white border border-[#E9E1D6] hover:border-[#C5A059] text-xs font-semibold text-slate-800 rounded-lg transition cursor-pointer shrink-0"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>

                  {/* Live Upload Progress */}
                  {isUploading && (
                    <div className="p-3 bg-white border border-[#E9E1D6] rounded-xl shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#29251F] flex items-center gap-1.5">
                          <Upload size={13} className="animate-bounce text-[#C5A059]" />
                          {uploadStatusText || 'Uploading images to Cloudinary / Atlas...'}
                        </span>
                        <span className="font-bold text-[#C5A059] font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C5A059] transition-all duration-200 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-1.5">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Wireframe Gallery: [Cover Image] [Image 2] [Image 3] */}
                  {(form.images || []).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                      {(form.images || []).map((imgUrl, idx) => {
                        const isCover = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl border overflow-hidden bg-white shadow-xs transition group ${
                              isCover
                                ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40'
                                : 'border-[#E9E1D6] hover:border-slate-400'
                            }`}
                          >
                            <div className="aspect-square w-full bg-[#FAF9F6] relative overflow-hidden flex items-center justify-center">
                              <img
                                src={getProductImageUrl(imgUrl)}
                                alt={isCover ? 'Cover Image' : `Image ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                }}
                                className="w-full h-full object-cover"
                              />

                              {/* Exact Wireframe Badge: [Cover Image] [Image 2] [Image 3] */}
                              <div className="absolute top-2 left-2">
                                {isCover ? (
                                  <span className="bg-[#29251F] text-[#C5A059] border border-[#C5A059] text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    <Star size={10} className="fill-[#C5A059]" /> Cover Image
                                  </span>
                                ) : (
                                  <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                                    Image {idx + 1}
                                  </span>
                                )}
                              </div>

                              {/* Top-Right Trash Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white rounded-full shadow-sm transition cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Card Action Footer */}
                            <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-gray-400 font-mono text-[10px]">
                                {isCover ? 'Cover Photo' : `Gallery #${idx}`}
                              </span>
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(idx)}
                                  className="text-[#C5A059] hover:text-[#29251F] font-bold hover:underline cursor-pointer"
                                >
                                  Set Cover
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-[#E9E1D6] rounded-xl text-center space-y-2 bg-[#FAF9F6]">
                      <ImageIcon size={28} className="mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">
                        No photos added yet. Click <strong className="text-[#29251F]">+ Upload Image</strong> above to attach pictures from your device.
                      </p>
                      <p className="text-[11px] text-gray-400">
                        First image will be automatically set as <strong className="text-[#C5A059]">[Cover Image]</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 6. MODAL FOOTER: [Cancel]                     [Save Product]  */}
              {/* ------------------------------------------------------------- */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E9E1D6] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-[#E9E1D6] hover:bg-slate-50 text-gray-700 text-xs uppercase tracking-wider font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-7 py-2.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-wider font-bold rounded-lg transition shadow-md flex items-center gap-2 cursor-pointer ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <Check size={15} />
                  <span>{isSubmitting ? 'Saving Product...' : 'Save Product'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
