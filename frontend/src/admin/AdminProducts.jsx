import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Search, X, Check, Image as ImageIcon, Upload, Star, AlertCircle } from 'lucide-react';
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

  const [form, setForm] = useState({
    title: '',
    brand: "Ni'maah Luxe",
    category: 'Kurtis',
    price: 15000,
    discountedPrice: 12999,
    images: [],
    sizes: ['S', 'M', 'L'],
    fabric: 'Pure Mulberry Silk',
    stockCount: 15,
    description: '',
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
    setForm({
      title: '',
      brand: "Ni'maah Luxe",
      category: 'Kurtis',
      price: 15000,
      discountedPrice: 12999,
      images: [],
      sizes: ['S', 'M', 'L'],
      fabric: 'Pure Mulberry Silk',
      stockCount: 15,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p._id);
    setSaveError('');
    const validImgs = (p.images || []).filter(
      (img) => img && typeof img === 'string' && !img.includes('unsplash.com')
    );
    setForm({
      title: p.title || '',
      brand: p.brand || "Ni'maah Luxe",
      category: p.category || 'Kurtis',
      price: p.price || 0,
      discountedPrice: p.discountedPrice ?? p.price ?? 0,
      images: validImgs,
      sizes: p.sizes || ['S', 'M', 'L'],
      fabric: p.fabric || 'Pure Mulberry Silk',
      stockCount: p.stockCount ?? 10,
      description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleSize = (sz) => {
    if (form.sizes.includes(sz)) {
      setForm({ ...form, sizes: form.sizes.filter((s) => s !== sz) });
    } else {
      setForm({ ...form, sizes: [...form.sizes, sz] });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSaveError('');

    try {
      if (!form.title?.trim()) throw new Error('Please enter a product title');
      if (!form.price || Number(form.price) <= 0) throw new Error('Please enter a valid price');
      if (!form.description?.trim()) throw new Error('Please enter an editorial description');

      const cleanImages = (form.images || []).filter(
        (img) => img && typeof img === 'string' && !img.includes('unsplash.com')
      );
      if (cleanImages.length === 0) {
        throw new Error('Please upload at least one authentic product image from your device.');
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        price: Number(form.price),
        discountedPrice: Number(form.discountedPrice !== undefined ? form.discountedPrice : form.price),
        stockCount: Number(form.stockCount || 0),
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
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
            Catalog Curation
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#29251F] mt-1">
            Dress & Apparel Management
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#29251F] hover:bg-[#A68B66] text-white text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition shadow-md"
        >
          <Plus size={16} />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white border border-[#E9E1D6] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-3 text-[#A68B66]" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66]"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total in Collection: <strong className="text-[#29251F]">{products.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E9E1D6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-gray-500 uppercase tracking-wider border-b border-[#E9E1D6]">
              <tr>
                <th className="py-3.5 px-4">Creation</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Offer</th>
                <th className="py-3.5 px-4">Available Sizes</th>
                <th className="py-3.5 px-4">Stock</th>
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
                        className="w-10 h-14 object-cover object-top border border-[#E9E1D6] rounded-xs bg-[#FAF9F6]"
                      />
                      {p.images && p.images.length > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-[#14110C] text-[#C5A059] border border-[#C5A059]/40 text-[9px] font-bold px-1 rounded shadow-xs" title={`${p.images.length} images total`}>
                          +{p.images.length - 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-serif-luxury text-sm font-semibold text-[#29251F]">{p.title}</p>
                      <p className="text-[10px] text-gray-400">{p.brand} • {p.fabric || 'Pure Silk'}</p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#FAF9F6] text-[#29251F] border border-[#E9E1D6] text-[10px] uppercase font-medium">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-serif-luxury font-semibold text-[#29251F]">
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
                        <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${p.stockCount > 5
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                    >
                      {p.stockCount} units
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
                      className="p-1.5 text-gray-500 hover:text-[#A68B66] hover:bg-[#FAF9F6] rounded"
                      title="Edit Piece"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Retire Piece"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E9E1D6] max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-3">
              <h3 className="font-serif-luxury text-xl text-[#29251F]">
                {editingId ? 'Edit Couture Piece' : 'Add New Atelier Creation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Fabric & Texture</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Privilege Price (₹)</label>
                  <input
                    type="number"
                    value={form.discountedPrice}
                    onChange={(e) => setForm({ ...form, discountedPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    required
                    value={form.stockCount}
                    onChange={(e) => setForm({ ...form, stockCount: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9E1D6]">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block uppercase tracking-wider text-gray-700 font-bold text-xs">
                          Product Photos & Gallery
                        </label>
                        <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] font-bold px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                          {(form.images || []).length} Photo{(form.images || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Image #1 is the <strong className="text-[#C5A059]">Main Cover Photo</strong>. Additional images form the interactive 3D gallery.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        id="admin-product-multi-upload"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleMultipleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <label
                        htmlFor="admin-product-multi-upload"
                        className={`px-3.5 py-1.5 bg-[#14110C] hover:bg-[#A68B66] text-white text-[11px] font-semibold rounded cursor-pointer inline-flex items-center space-x-1.5 shadow-sm transition ${
                          isUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <Upload size={13} className="text-[#C5A059]" />
                        <span>{isUploading ? 'Uploading to Cloudinary...' : 'Upload Photos (Cloudinary)'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Add URL Row */}
                  <div className="mt-3 flex items-center gap-2">
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
                      placeholder="Paste image URL here and click Add..."
                      className="flex-1 p-2 bg-[#FAF9F6] border border-[#E9E1D6] focus:outline-none focus:border-[#A68B66] text-xs rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 bg-white border border-[#E9E1D6] hover:border-[#C5A059] text-xs font-semibold text-slate-800 rounded transition cursor-pointer"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Live Upload Progress */}
                  {isUploading && (
                    <div className="mt-2.5 p-3 bg-white border border-[#E9E1D6] rounded shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#14110C] flex items-center gap-1.5">
                          <Upload size={13} className="animate-bounce text-[#C5A059]" />
                          {uploadStatusText || 'Uploading images to Cloudinary...'}
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

                  {/* Upload Error Banner */}
                  {uploadError && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center space-x-1.5">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Images Grid */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(form.images || []).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg border overflow-hidden bg-white shadow-xs transition group ${
                          idx === 0
                            ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30'
                            : 'border-[#E9E1D6] hover:border-slate-400'
                        }`}
                      >
                        <div className="aspect-square w-full bg-[#FAF9F6] relative overflow-hidden flex items-center justify-center">
                          <img
                            src={getProductImageUrl(imgUrl)}
                            alt={`Product ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                            className="w-full h-full object-cover"
                          />

                          {/* Badge */}
                          <div className="absolute top-1.5 left-1.5">
                            {idx === 0 ? (
                              <span className="bg-[#14110C] text-[#C5A059] border border-[#C5A059] text-[9.5px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                <Star size={10} className="fill-[#C5A059]" /> Main Image
                              </span>
                            ) : (
                              <span className="bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(idx)}
                                className="p-1 bg-white/95 hover:bg-[#C5A059] text-slate-700 hover:text-white rounded-full shadow-sm transition cursor-pointer"
                                title="Set as Main Cover Photo"
                              >
                                <Star size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white rounded-full shadow-sm transition cursor-pointer"
                              title="Remove Image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-gray-400 truncate max-w-[100px]">
                            {imgUrl.startsWith('data:') ? 'Local Image' : imgUrl}
                          </span>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="text-[#C5A059] hover:underline font-bold"
                            >
                              Set Main
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => {
                      const selected = form.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-3 py-1.5 border text-xs uppercase font-semibold transition ${selected
                            ? 'bg-[#29251F] text-white border-[#29251F]'
                            : 'bg-white border-[#E9E1D6] text-gray-700'
                            }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block uppercase tracking-wider text-gray-500 mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E9E1D6]"
                    placeholder="Describe the silhouette, embroidery, and evening styling notes..."
                  ></textarea>
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E9E1D6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-[#29251F] text-white hover:bg-[#A68B66] uppercase tracking-widest text-xs font-semibold transition flex items-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  <span>{isSubmitting ? 'Saving Piece...' : 'Save Piece'}</span>
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
