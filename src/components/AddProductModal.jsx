import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, FileImage, RefreshCw } from 'lucide-react';
import { analyzeProductImage } from '../services/geminiService';

export default function AddProductModal({ isOpen, onClose, onAddProduct, existingProducts }) {
  if (!isOpen) return null;

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [specs, setSpecs] = useState({});

  // AI Mocking upload states: 'idle' | 'uploading' | 'processing' | 'completed'
  const [aiState, setAiState] = useState('idle');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Trigger file upload click
  const handleDropzoneClick = () => {
    if (aiState === 'idle') {
      fileInputRef.current?.click();
    }
  };

  // Gemini Vision AI extraction calling geminiService
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      
      setAiState('uploading');
      
      // Simulate file upload transition of 800ms
      setTimeout(() => {
        setAiState('processing');
        
        // Call vision service
        analyzeProductImage(reader.result)
          .then((res) => {
            if (res.success && res.data) {
              setSku(res.data.sku || res.data.sku); // Support SKU key name varieties
              setName(res.data.name || '');
              setBrand(res.data.brand || '');
              setCategory(res.data.category || '');
              setPrice(res.data.price !== undefined ? String(res.data.price) : '');
              setStock(res.data.stock !== undefined ? String(res.data.stock) : '');
              setSpecs(res.data.specs || {});
              setAiState('completed');
              setErrors({});
            }
          })
          .catch((err) => {
            console.error("AI Intake classification failed", err);
            setAiState('idle');
          });
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  // Validation & Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!sku.trim()) {
      newErrors.sku = 'SKU / ID is required.';
    } else if (existingProducts.some(p => p.id.toLowerCase() === sku.trim().toLowerCase())) {
      newErrors.sku = 'This SKU is already registered in the catalog.';
    }

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

    // Call inventory state hook
    const newProduct = {
      id: sku.trim().toUpperCase(),
      name: name.trim(),
      brand: brand.trim() || 'Generic',
      category: category.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      image: imagePreview || 'https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60',
      specs: specs && Object.keys(specs).length > 0 ? specs : {
        "Auto-Filled": "Yes, AI Vision Intake"
      }
    };

    try {
      onAddProduct(newProduct);
      resetForm();
      onClose();
    } catch (err) {
      setErrors({ sku: err.message });
    }
  };

  const resetForm = () => {
    setSku('');
    setName('');
    setBrand('');
    setCategory('');
    setPrice('');
    setStock('');
    setImagePreview('');
    setSpecs({});
    setAiState('idle');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300">
      <div className="w-full max-w-xl glass-modal overflow-hidden animate-fadeIn my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary/50 bg-bg-secondary/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-md font-bold text-text-primary">Register Component</h2>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* AI Intake Dropzone Panel */}
          <div 
            onClick={handleDropzoneClick}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
              aiState === 'idle' 
                ? 'border-border-primary/80 bg-bg-primary/45 hover:border-brand-500/50 hover:bg-brand-500/5' 
                : aiState === 'completed'
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-brand-500/60 bg-brand-500/5 animate-pulse'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={aiState !== 'idle'}
            />

            {aiState === 'idle' && (
              <>
                <Upload className="w-8 h-8 text-brand-500 mb-2" />
                <span className="text-sm font-semibold text-text-primary block">AI Vision Auto-Fill</span>
                <span className="text-[10px] text-text-muted mt-1 leading-relaxed block max-w-xs">
                  Drop a product label image here or click to upload. Gemini will automatically extract SKU, name, and specifications.
                </span>
              </>
            )}

            {aiState === 'uploading' && (
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
                <span className="text-xs font-bold text-brand-500 block uppercase tracking-wider">Uploading Image...</span>
              </div>
            )}

            {aiState === 'processing' && (
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <span className="text-xs font-bold text-indigo-500 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" /> AI Analyzing...
                </span>
              </div>
            )}

            {aiState === 'completed' && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4 text-left">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-emerald-500/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><FileImage className="w-6 h-6" /></div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-wider">
                      ✓ Extraction Complete
                    </span>
                    <span className="text-[11px] text-text-primary font-semibold block mt-0.5">
                      {name || 'Product'} detected
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      Specs loaded. Review details below.
                    </span>
                  </div>
                </div>
                
                {/* Refresh AI Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering dropzone upload click
                    setAiState('idle');
                    setImagePreview('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border-primary hover:border-brand-500/50 hover:bg-brand-500/5 rounded-lg text-xs font-semibold text-text-secondary hover:text-brand-500 transition-all shrink-0 ml-4"
                  title="Upload a different label image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh AI</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SKU Input */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">SKU / ID *</label>
              <input
                type="text"
                placeholder="e.g. SKU-LED-9W-002"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  if (errors.sku) setErrors(prev => ({ ...prev, sku: null }));
                }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary font-mono uppercase ${
                  errors.sku ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-border-primary/80'
                }`}
              />
              {errors.sku && (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.sku}
                </span>
              )}
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
                placeholder="e.g. LED Bulbs, Smart Switches, Fans"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${
                  errors.category ? 'border-rose-500 focus:ring-rose-500' : 'border-border-primary/80'
                }`}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
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
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Initial Stock *</label>
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
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2 rounded-xl border border-border-primary text-xs font-bold text-text-secondary hover:bg-border-secondary hover:text-text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
            >
              Register SKU
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
