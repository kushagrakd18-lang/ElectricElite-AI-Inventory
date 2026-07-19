import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, FileImage, RefreshCw, Plus, Trash2, Images, CheckCircle } from 'lucide-react';
import { analyzeMultipleProductImages } from '../services/geminiService';

const MAX_IMAGES = 4;

export default function AddProductModal({ isOpen, onClose, onAddProduct, existingProducts }) {
  if (!isOpen) return null;

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [specs, setSpecs] = useState({});

  // Multi-image state: array of { preview: string (base64), file: File }
  const [images, setImages] = useState([]);
  const [aiState, setAiState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'completed'
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Open file picker
  const handleDropzoneClick = () => {
    if (images.length < MAX_IMAGES) {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection — accept multiple files up to MAX_IMAGES
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Clamp to remaining slots
    const remaining = MAX_IMAGES - images.length;
    const toLoad = files.slice(0, remaining);

    let loaded = 0;
    const newImages = [];

    setAiState('uploading');

    toLoad.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({ preview: reader.result, file });
        loaded++;
        if (loaded === toLoad.length) {
          const allImages = [...images, ...newImages];
          setImages(allImages);

          // Small delay then start AI processing
          setTimeout(() => {
            setAiState('processing');
            const base64Array = allImages.map((img) => img.preview);

            analyzeMultipleProductImages(base64Array)
              .then((res) => {
                if (res.success && res.data) {
                  setSku(res.data.sku || '');
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
                console.error('AI multi-image extraction failed', err);
                setAiState('idle');
              });
          }, 600);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be re-selected after removal
    e.target.value = '';
  };

  // Remove a single image from the list
  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    if (updated.length === 0) {
      setAiState('idle');
      setSku(''); setName(''); setBrand(''); setCategory('');
      setPrice(''); setStock(''); setSpecs({});
    }
  };

  // Re-run AI analysis on current images
  const handleReanalyze = () => {
    if (images.length === 0) return;
    setAiState('processing');
    const base64Array = images.map((img) => img.preview);
    analyzeMultipleProductImages(base64Array)
      .then((res) => {
        if (res.success && res.data) {
          setSku(res.data.sku || '');
          setName(res.data.name || '');
          setBrand(res.data.brand || '');
          setCategory(res.data.category || '');
          setPrice(res.data.price !== undefined ? String(res.data.price) : '');
          setStock(res.data.stock !== undefined ? String(res.data.stock) : '');
          setSpecs(res.data.specs || {});
          setAiState('completed');
        }
      })
      .catch(() => setAiState('completed'));
  };

  // Form validation & submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!sku.trim()) {
      newErrors.sku = 'SKU / ID is required.';
    } else if (existingProducts.some((p) => p.id.toLowerCase() === sku.trim().toLowerCase())) {
      newErrors.sku = 'This SKU is already registered in the catalog.';
    }
    if (!name.trim()) newErrors.name = 'Product name is required.';
    if (!category.trim()) newErrors.category = 'Category is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Enter a valid price greater than 0.';
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) newErrors.stock = 'Enter a valid stock count (0 or more).';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newProduct = {
      id: sku.trim().toUpperCase(),
      name: name.trim(),
      brand: brand.trim() || 'Generic',
      category: category.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      // Primary image for the catalog card (first image uploaded)
      image: images[0]?.preview || 'https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60',
      // All images array — used by PamphletModal
      images: images.length > 0 ? images.map((img) => img.preview) : [],
      specs: specs && Object.keys(specs).length > 0 ? specs : { "Auto-Filled": "Yes, AI Vision Intake" }
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
    setSku(''); setName(''); setBrand(''); setCategory('');
    setPrice(''); setStock(''); setSpecs({}); setImages([]);
    setAiState('idle'); setErrors({});
  };

  const canAddMore = images.length < MAX_IMAGES;
  const isProcessing = aiState === 'uploading' || aiState === 'processing';

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300">
      <div className="w-full max-w-xl glass-modal overflow-hidden animate-fadeIn my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary/50 bg-bg-secondary/40">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-brand-500" />
            <div>
              <h2 className="text-md font-bold text-text-primary leading-none">Register Component</h2>
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Upload up to {MAX_IMAGES} images for richer AI extraction
              </span>
            </div>
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

          {/* ── Multi-Image Upload Section ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                AI Vision Auto-Fill
                <span className="text-[10px] font-normal text-text-muted normal-case tracking-normal ml-1">
                  ({images.length}/{MAX_IMAGES} images)
                </span>
              </label>
              {images.length > 0 && !isProcessing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReanalyze}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 uppercase tracking-wider transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-Analyze
                  </button>
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Filled image slots */}
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border-primary/60 bg-bg-primary">
                  <img src={img.preview} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white rounded-md px-1 py-0.5">
                    {idx + 1}
                  </span>
                </div>
              ))}

              {/* Add-more slot */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={handleDropzoneClick}
                  disabled={isProcessing}
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                    isProcessing
                      ? 'border-brand-500/40 bg-brand-500/5 cursor-wait'
                      : 'border-border-primary/80 bg-bg-primary/45 hover:border-brand-500/60 hover:bg-brand-500/5 cursor-pointer'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-brand-500" />
                      <span className="text-[9px] font-semibold text-text-muted">Add</span>
                    </>
                  )}
                </button>
              )}

              {/* Empty placeholder slots */}
              {Array.from({ length: Math.max(0, MAX_IMAGES - images.length - (canAddMore ? 1 : 0)) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-xl border border-dashed border-border-primary/40 bg-bg-primary/20 flex items-center justify-center"
                >
                  <FileImage className="w-5 h-5 text-border-primary/60" />
                </div>
              ))}
            </div>

            {/* Hidden file input — accepts multiple */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />

            {/* Status bar */}
            {images.length === 0 && (
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                Upload 1–4 product images. Gemini will cross-reference all angles to auto-fill specs accurately.
              </p>
            )}
            {aiState === 'uploading' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 justify-center animate-pulse">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                Loading images...
              </div>
            )}
            {aiState === 'processing' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 justify-center animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Gemini is analyzing {images.length} image{images.length > 1 ? 's' : ''} for specs...
              </div>
            )}
            {aiState === 'completed' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 justify-center">
                <CheckCircle className="w-3.5 h-3.5" />
                Extraction complete from {images.length} image{images.length > 1 ? 's' : ''}! Review fields below.
              </div>
            )}
          </div>

          {/* ── Form Fields Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* SKU */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">SKU / ID *</label>
              <input
                type="text"
                placeholder="e.g. SKU-LED-9W-002"
                value={sku}
                onChange={(e) => { setSku(e.target.value); if (errors.sku) setErrors((p) => ({ ...p, sku: null })); }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary font-mono uppercase ${errors.sku ? 'border-rose-500' : 'border-border-primary/80'}`}
              />
              {errors.sku && <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sku}</span>}
            </div>

            {/* Brand */}
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

            {/* Product Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. 12W RGB Smart Strip"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: null })); }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${errors.name ? 'border-rose-500' : 'border-border-primary/80'}`}
              />
              {errors.name && <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</span>}
            </div>

            {/* Category */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Category *</label>
              <input
                type="text"
                placeholder="e.g. LED Bulbs, Smart Switches, Fans"
                value={category}
                onChange={(e) => { setCategory(e.target.value); if (errors.category) setErrors((p) => ({ ...p, category: null })); }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${errors.category ? 'border-rose-500' : 'border-border-primary/80'}`}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="LED Bulbs" />
                <option value="Smart Switches" />
                <option value="Ceiling Fans" />
                <option value="Extension Boards" />
                <option value="Voltage Stabilizers" />
                <option value="MCBs & Circuit Breakers" />
                <option value="Wires & Cables" />
              </datalist>
              {errors.category && <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</span>}
            </div>

            {/* Price */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Price (INR) *</label>
              <input
                type="number"
                placeholder="e.g. 299"
                value={price}
                onChange={(e) => { setPrice(e.target.value); if (errors.price) setErrors((p) => ({ ...p, price: null })); }}
                step="0.01"
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${errors.price ? 'border-rose-500' : 'border-border-primary/80'}`}
              />
              {errors.price && <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price}</span>}
            </div>

            {/* Stock */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Initial Stock *</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={stock}
                onChange={(e) => { setStock(e.target.value); if (errors.stock) setErrors((p) => ({ ...p, stock: null })); }}
                className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-xl focus:outline-none focus:ring-1 focus:border-brand-500 focus:ring-brand-500 text-text-primary ${errors.stock ? 'border-rose-500' : 'border-border-primary/80'}`}
              />
              {errors.stock && <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.stock}</span>}
            </div>
          </div>

          {/* Extracted Specs Preview (read-only badge list) */}
          {Object.keys(specs).length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> AI-Extracted Specifications
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-bg-primary/60 border border-border-primary/60 rounded-xl">
                {Object.entries(specs).slice(0, 10).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-semibold text-brand-500">
                    <span className="text-text-muted">{k}:</span> {v}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
            >
              Register SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
