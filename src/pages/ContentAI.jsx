import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Copy, Check, Download, AlertCircle, ShoppingBag, Send, Printer } from 'lucide-react';
import { generateCopywriting } from '../services/geminiService';
import useInventory from '../hooks/useInventory';
import PamphletModal from '../components/PamphletModal';

export default function ContentAI() {
  const { products } = useInventory();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [isPamphletOpen, setIsPamphletOpen] = useState(false);

  // Auto-select the first product if available
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleGenerate = () => {
    if (!selectedProduct) return;
    setLoading(true);
    setError(null);
    setData(null);

    const apiKey = localStorage.getItem('electric_elite_gemini_key') || '';
    generateCopywriting(selectedProduct, apiKey)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Failed to generate listing copy. Please try again.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("AI Generation failed:", err);
        setError(err.message || 'An error occurred during generation.');
        setLoading(false);
      });
  };

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSection(sectionName);
        setTimeout(() => setCopiedSection(null), 2000);
      })
      .catch((err) => console.error("Failed to copy text:", err));
  };

  const handleDownloadAll = () => {
    if (!data || !selectedProduct) return;
    const fileContent = `ElectricElite AI Copywriting Output
=========================================
Product: ${selectedProduct.name}
SKU: ${selectedProduct.id}
Brand: ${selectedProduct.brand}
=========================================

1. SEO TITLE:
${data.seoTitle}

2. PRODUCT DESCRIPTION:
${data.description}

3. AMAZON/FLIPKART BULLET POINTS:
${data.bullets}

4. INSTAGRAM POST CAPTION:
${data.instagramCaption}
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedProduct.id}_marketing_copy.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-primary/60 bg-bg-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary m-0">AI Marketing Copywriter</h2>
            <p className="text-text-secondary text-xs mt-0.5">
              Select catalog items to instantly generate SEO-optimized titles, product descriptions, Flipkart bullets, and Instagram captions.
            </p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-base font-bold text-text-primary mb-1">No products in catalog</h3>
          <p className="text-text-secondary text-xs max-w-sm mb-6">
            You must register products in the inventory catalog first before writing listing copy.
          </p>
          <a
            href="/inventory"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/15"
          >
            Go to Inventory
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Product Selection & Specs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Product Configuration</h3>
              
              {/* Product Select Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Select Component</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setData(null);
                    setError(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-text-primary cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="space-y-4 pt-4 border-t border-border-primary/60">
                  {/* Selected Product Card */}
                  <div className="flex items-center gap-3">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-12 h-12 rounded-lg object-cover border border-border-primary" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-border-secondary flex items-center justify-center text-text-muted">📦</div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-text-primary block leading-tight">{selectedProduct.name}</span>
                      <span className="text-[10px] text-text-muted mt-0.5 block">by {selectedProduct.brand} | {selectedProduct.category}</span>
                    </div>
                  </div>

                  {/* Pricing and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-bg-primary rounded-xl border border-border-primary/60">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Price</span>
                      <span className="text-xs font-bold text-text-primary block mt-0.5">{formatCurrency(selectedProduct.price)}</span>
                    </div>
                    <div className="p-3 bg-bg-primary rounded-xl border border-border-primary/60">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Available Stock</span>
                      <span className="text-xs font-bold text-text-primary block mt-0.5">{selectedProduct.stock} Units</span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Specifications</span>
                    <div className="bg-bg-primary rounded-xl p-3 border border-border-primary/60 text-xs space-y-1.5 font-medium text-text-secondary">
                      {Object.entries(selectedProduct.specs || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-text-muted">{k}:</span>
                          <span className="text-text-primary">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Generating copy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Copywriting</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Generation Panel */}
          <div className="lg:col-span-2">
            <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 min-h-[480px] shadow-sm flex flex-col justify-between">
              
              {!loading && !data && !error && (
                <div className="my-auto text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Generate E-commerce Marketing Copy</h3>
                  <p className="text-text-secondary text-xs max-w-sm">
                    Configure a product on the left, then click generate. The AI will output localized content formatted for the Indian market.
                  </p>
                </div>
              )}

              {loading && (
                <div className="my-auto text-center py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">AI Copywriter is writing copy...</h3>
                    <p className="text-text-secondary text-xs max-w-sm mt-1">
                      Generating marketplace listings, features list, and localized description in INR (₹).
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="my-auto p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-500 flex gap-3 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Generation Error</span>
                    <span className="block mt-0.5">{error}</span>
                  </div>
                </div>
              )}

              {data && !loading && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between pb-3 border-b border-border-primary/60">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Generated Output</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsPamphletOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border-primary hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg text-[10px] font-bold text-text-secondary hover:text-emerald-500 transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Create Pamphlet</span>
                      </button>
                      <button
                        onClick={handleDownloadAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border-primary hover:border-brand-500/50 hover:bg-brand-500/5 rounded-lg text-[10px] font-bold text-text-secondary hover:text-brand-500 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download All (.txt)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* SEO Title */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">SEO Optimized Title</span>
                        <button
                          onClick={() => handleCopy(data.seoTitle, 'seoTitle')}
                          className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                        >
                          {copiedSection === 'seoTitle' ? <span className="text-emerald-500">✓ Copied</span> : <span>Copy</span>}
                        </button>
                      </div>
                      <div className="p-3 bg-bg-primary border border-border-primary/60 rounded-xl text-xs font-semibold text-text-primary select-all">
                        {data.seoTitle}
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Flipkart/Amazon Bullet Points</span>
                        <button
                          onClick={() => handleCopy(data.bullets, 'bullets')}
                          className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                        >
                          {copiedSection === 'bullets' ? <span className="text-emerald-500">✓ Copied</span> : <span>Copy</span>}
                        </button>
                      </div>
                      <div className="p-3 bg-bg-primary border border-border-primary/60 rounded-xl text-xs text-text-secondary font-mono select-all leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {data.bullets}
                      </div>
                    </div>

                    {/* Product Description */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Product Description (INR Localized)</span>
                        <button
                          onClick={() => handleCopy(data.description, 'description')}
                          className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                        >
                          {copiedSection === 'description' ? <span className="text-emerald-500">✓ Copied</span> : <span>Copy</span>}
                        </button>
                      </div>
                      <div className="p-3 bg-bg-primary border border-border-primary/60 rounded-xl text-xs text-text-secondary select-all leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {data.description}
                      </div>
                    </div>

                    {/* Instagram Post */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Instagram Social Post</span>
                        <button
                          onClick={() => handleCopy(data.instagramCaption, 'instagramCaption')}
                          className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                        >
                          {copiedSection === 'instagramCaption' ? <span className="text-emerald-500">✓ Copied</span> : <span>Copy</span>}
                        </button>
                      </div>
                      <div className="p-3 bg-bg-primary border border-border-primary/60 rounded-xl text-xs text-text-secondary select-all leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {data.instagramCaption}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Automated Catalog Pamphlet Modal */}
      <PamphletModal
        isOpen={isPamphletOpen}
        onClose={() => setIsPamphletOpen(false)}
        product={selectedProduct}
        initialDescription={data?.description}
      />
    </div>
  );
}
