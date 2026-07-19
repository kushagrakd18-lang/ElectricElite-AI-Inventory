import React, { useState, useEffect } from 'react';
import { X, Printer, Tag, Palette, Layout, BadgePercent, QrCode, Images } from 'lucide-react';

export default function PamphletModal({ isOpen, onClose, product, initialDescription = '' }) {
  // Collect all product images — prefer product.images array, else fall back to single product.image
  const productImages = (
    product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : [])
  ).slice(0, 4);
  const [tagline, setTagline] = useState('SPECIAL PROMOTIONAL OFFER');
  const [discount, setDiscount] = useState(15);
  const [accentColor, setAccentColor] = useState('indigo');
  const [customDesc, setCustomDesc] = useState('');

  // Synchronize when product or initialDescription changes
  useEffect(() => {
    if (product) {
      setCustomDesc(
        initialDescription || 
        `Get the premium ${product.brand} ${product.name} at an exclusive discount. Designed for high durability and energy efficiency, it is the perfect addition to modern electrical networks and smart setups.`
      );
    }
  }, [product, initialDescription]);

  if (!isOpen || !product) return null;

  // Formatting currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculatedOriginalPrice = product.price;
  const calculatedDiscountedPrice = product.price * (1 - discount / 100);

  const colors = {
    indigo: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-600',
      gradient: 'from-indigo-600 to-violet-700',
      lightBg: 'bg-indigo-50 dark:bg-indigo-950/20',
      lightBorder: 'border-indigo-200 dark:border-indigo-900/40',
      pill: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-600',
      gradient: 'from-emerald-600 to-teal-700',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      lightBorder: 'border-emerald-200 dark:border-emerald-900/40',
      pill: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-600',
      gradient: 'from-amber-600 to-orange-700',
      lightBg: 'bg-amber-50 dark:bg-amber-950/20',
      lightBorder: 'border-amber-200 dark:border-amber-900/40',
      pill: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
    },
    rose: {
      bg: 'bg-rose-600',
      text: 'text-rose-600',
      border: 'border-rose-600',
      gradient: 'from-rose-600 to-pink-700',
      lightBg: 'bg-rose-50 dark:bg-rose-950/20',
      lightBorder: 'border-rose-200 dark:border-rose-900/40',
      pill: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
    }
  };

  const scheme = colors[accentColor] || colors.indigo;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:block">
      {/* Dynamic print CSS injection to guarantee only flyer prints on A4 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />

      <div className="relative bg-bg-card border border-border-primary/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] print:hidden">
        
        {/* Left Side: Customize controls */}
        <div className="w-full md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-border-primary overflow-y-auto space-y-6 shrink-0 bg-bg-secondary/40">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-text-primary">Pamphlet Customizer</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-border-secondary transition-all md:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image count info */}
          {productImages.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs text-brand-500 font-semibold">
              <Images className="w-3.5 h-3.5" />
              <span>{productImages.length} product image{productImages.length > 1 ? 's' : ''} will appear in pamphlet</span>
            </div>
          )}

          {/* Config fields */}
          <div className="space-y-4">
            
            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-brand-500" />
                <span>Header Tagline</span>
              </label>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-bg-primary border border-border-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-text-primary"
                placeholder="e.g. SPECIAL PROMOTIONAL OFFER"
              />
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <BadgePercent className="w-3.5 h-3.5 text-brand-500" />
                <span>Discount Rate (%)</span>
              </label>
              <div className="flex gap-3 items-center">
                <input 
                  type="range" 
                  min="0"
                  max="70"
                  step="5"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="flex-1 accent-brand-500 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary w-8 text-right">{discount}%</span>
              </div>
            </div>

            {/* Color Accent Scheme */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-500" />
                <span>Accent Color</span>
              </label>
              <div className="flex gap-2.5">
                {Object.keys(colors).map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center capitalize text-[10px] font-bold transition-all cursor-pointer ${
                      accentColor === c 
                        ? 'border-brand-500 scale-105 shadow-sm' 
                        : 'border-transparent hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: c === 'indigo' ? '#8b5cf6' : c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : '#f43f5e',
                      color: '#fff'
                    }}
                    title={`${c} theme`}
                  >
                    {accentColor === c && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-brand-500" />
                <span>Promotional Description</span>
              </label>
              <textarea 
                rows="5"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-bg-primary border border-border-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-text-primary resize-none"
                placeholder="Write compelling brochure highlights..."
              />
            </div>

          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-border-primary flex flex-col gap-2.5">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pamphlet (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-transparent hover:bg-border-secondary border border-border-primary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Close Customize Mode
            </button>
          </div>
        </div>

        {/* Right Side: Print A4 Preview layout */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900 flex justify-center items-start print:p-0 print:bg-white">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-border-secondary/60 transition-all border border-border-primary/20 shrink-0 cursor-pointer md:block hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* A4 Paper Container */}
          <div 
            id="print-area" 
            className="w-full max-w-[500px] aspect-[1/1.41] bg-white text-slate-800 shadow-xl border border-slate-300/40 rounded-sm p-8 flex flex-col justify-between overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full print:h-[297mm] print:p-[20mm]"
          >
            {/* Pamphlet Border Frame */}
            <div className={`border-4 ${scheme.border} h-full p-6 flex flex-col justify-between`}>
              
              {/* Header block */}
              <div className="text-center space-y-2 pb-4 border-b border-dashed border-slate-200">
                <span className={`inline-block px-3 py-0.5 text-[10px] font-bold text-white tracking-widest uppercase rounded-full ${scheme.bg}`}>
                  {tagline}
                </span>
                
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
                  Electric<span className="text-indigo-600">Elite</span>
                </h1>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Premium Electrical Hardware Catalog</p>
              </div>

              {/* Product Info Block */}
              <div className="my-auto py-6 space-y-6">
                
                {/* Title & Brand */}
                <div className="text-center">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.brand} Products</span>
                  <h2 className="text-xl font-black text-slate-800 leading-tight mt-0.5">{product.name}</h2>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                    Category: {product.category}
                  </span>
                </div>

                {/* Image Showcase — multi-image grid */}
                <div className="flex justify-center">
                  {productImages.length === 0 ? (
                    <div className="w-32 h-32 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-3xl">📦</div>
                  ) : productImages.length === 1 ? (
                    <img
                      src={productImages[0]}
                      alt={product.name}
                      className="w-32 h-32 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className={`grid gap-1.5 ${
                      productImages.length === 2 ? 'grid-cols-2 w-40' :
                      productImages.length === 3 ? 'grid-cols-3 w-52' :
                      'grid-cols-2 w-44'
                    }`}>
                      {productImages.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`${product.name} view ${idx + 1}`}
                            className="w-full aspect-square rounded-lg object-cover border border-slate-200 shadow-sm"
                          />
                          <span className="absolute top-0.5 left-0.5 text-[7px] font-bold bg-black/50 text-white rounded px-0.5">{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promo Text */}
                <p className="text-xs text-slate-600 text-center leading-relaxed italic max-w-sm mx-auto px-4">
                  "{customDesc}"
                </p>

                {/* Product Specifications */}
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider text-center">Component Specifications</h3>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[10px] font-medium text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {Object.entries(product.specs || {}).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-200/40 pb-1">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-slate-800 font-bold text-right truncate max-w-[100px]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Price Call-out & Footer */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                
                {/* Promo Pricing Display */}
                <div className="flex justify-around items-center bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-xs mx-auto">
                  {discount > 0 ? (
                    <>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Regular Price</span>
                        <span className="text-xs font-semibold text-slate-400 line-through block">{formatCurrency(calculatedOriginalPrice)}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${scheme.bg}`}>
                        Save {discount}%
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase block">Special Price</span>
                        <span className="text-sm font-black text-slate-900 block">{formatCurrency(calculatedDiscountedPrice)}</span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block text-center">Unit Price</span>
                      <span className="text-sm font-black text-slate-900 block text-center">{formatCurrency(calculatedOriginalPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Footer contact details and Mock Barcode / QR */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 px-2 font-medium">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-600">ElectricElite Wholesale Hub</p>
                    <p>🌐 www.electricelite.com</p>
                    <p>📧 support@electricelite.com</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <QrCode className="w-8 h-8 text-slate-600" />
                    <span className="text-[7px] font-mono tracking-widest text-slate-400 uppercase">{product.id}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
