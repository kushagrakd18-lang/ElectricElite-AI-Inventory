import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, AlertCircle, FileImage, Upload } from 'lucide-react';

export default function EditProductModal({ isOpen, onClose, product, onUpdateProduct }) {
  if (!isOpen || !product) return null;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Load product fields on load / change
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setPrice(product.price !== undefined ? String(product.price) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '');
      setImagePreview(product.image || '');
      setErrors({});
    }
  }, [product, isOpen]);

  // Handle image upload change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required.';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0.';
    }

    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = 'Please enter a valid stock count (0 or more).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedProduct = {
      name: name.trim(),
      brand: brand.trim() || 'Generic',
      category: category.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      image: imagePreview
    };

    onUpdateProduct(product.id, updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300">
      <div className="w-full max-w-xl glass-modal overflow-hidden animate-fadeIn my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary/50 bg-bg-secondary/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-md font-bold text-text-primary">Edit Catalog SKU</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Image Selection Display */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-bg-primary/55 border border-border-primary/60">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border-primary/80" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-border-secondary flex items-center justify-center text-text-muted">
                📦
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-bold text-text-primary block uppercase tracking-wider">Product Image</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-primary hover:border-brand-500/50 hover:bg-brand-500/5 rounded-lg text-xs font-semibold text-text-secondary hover:text-brand-500 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Replace Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SKU Input (Read-only / Disabled) */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">SKU / ID (Primary Key)</label>
              <input
                type="text"
                value={product.id}
                disabled
                className="w-full px-3 py-2 text-sm bg-bg-primary/70 border border-border-primary/40 rounded-xl text-text-muted font-mono uppercase cursor-not-allowed opacity-75"
                title="Product SKU cannot be modified after registration"
              />
            </div>

            {/* Brand Input */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Brand</label>
              <input
                type="text"
                placeholder="e.g. EliteGlow"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary"
              />
            </div>

            {/* Product Name Input */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. 12W RGB Smart Strip"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${
                  errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-border-primary/80'
                }`}
              />
              {errors.name && (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            {/* Category Input */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Category *</label>
              <input
                type="text"
                placeholder="e.g. LED Bulbs, Smart Switches"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${
                  errors.category ? 'border-rose-500 focus:ring-rose-500' : 'border-border-primary/80'
                }`}
                list="edit-category-suggestions"
              />
              <datalist id="edit-category-suggestions">
                <option value="LED Bulbs" />
                <option value="Smart Switches" />
                <option value="Ceiling Fans" />
                <option value="Extension Boards" />
              </datalist>
              {errors.category && (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.category}
                </span>
              )}
            </div>

            {/* Price Input */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Price (INR) *</label>
              <input
                type="number"
                placeholder="e.g. 299"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors(prev => ({ ...prev, price: null }));
                }}
                step="0.01"
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${
                  errors.price ? 'border-rose-500 focus:ring-rose-500' : 'border-border-primary/80'
                }`}
              />
              {errors.price && (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.price}
                </span>
              )}
            </div>

            {/* Stock Input */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Current Stock *</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors(prev => ({ ...prev, stock: null }));
                }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${
                  errors.stock ? 'border-rose-500 focus:ring-rose-500' : 'border-border-primary/80'
                }`}
              />
              {errors.stock && (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.stock}
                </span>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-primary/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-primary text-xs font-bold text-text-secondary hover:bg-border-secondary hover:text-text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
