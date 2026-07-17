import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { generateCopywriting } from '../services/geminiService';

export default function ContentGeneratorModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    if (isOpen && product) {
      setLoading(true);
      setError(null);
      setData(null);

      const apiKey = localStorage.getItem('electric_elite_gemini_key') || '';
      generateCopywriting(product, apiKey)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError('Failed to generate listing copy. Please try again.');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Copywriting generation failed:", err);
          setError(err.message || 'An error occurred during generation.');
          setLoading(false);
        });
    }
  }, [isOpen, product]);

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSection(sectionName);
        setTimeout(() => setCopiedSection(null), 2000);
      })
      .catch((err) => console.error("Failed to copy text:", err));
  };

  const handleDownloadAll = () => {
    if (!data) return;
    const fileContent = `ElectricElite AI Copywriting Output
=========================================
Product: ${product.name}
SKU: ${product.id}
Brand: ${product.brand}
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
    link.download = `${product.id}_marketing_copy.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300">
      <div className="w-full max-w-2xl glass-modal overflow-hidden animate-fadeIn my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary/50 bg-bg-secondary/40 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <div>
              <h2 className="text-sm font-bold text-text-primary m-0">AI Marketing Copywriter</h2>
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Listing Copy for {product.brand} {product.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              <div className="text-center">
                <span className="text-sm font-bold text-text-primary block">AI Copywriter at work...</span>
                <span className="text-xs text-text-muted mt-1 block">
                  Generating Indian e-commerce listing copies and social media captions (INR localized).
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-500 flex gap-3 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Generation Error</span>
                <span className="block mt-0.5">{error}</span>
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6">
              
              {/* Section 1: SEO Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    SEO Marketplace Title
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.seoTitle, 'seoTitle')}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                  >
                    {copiedSection === 'seoTitle' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Title</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-bg-primary border border-border-primary/80 rounded-xl text-sm font-semibold text-text-primary select-all">
                  {data.seoTitle}
                </div>
              </div>

              {/* Section 2: Bullet Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Amazon / Flipkart Feature Bullets
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.bullets, 'bullets')}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                  >
                    {copiedSection === 'bullets' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Bullets</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-bg-primary border border-border-primary/80 rounded-xl text-xs text-text-secondary font-mono select-all leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {data.bullets}
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Product Description (INR Localized)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.description, 'description')}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                  >
                    {copiedSection === 'description' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Desc</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-bg-primary border border-border-primary/80 rounded-xl text-xs text-text-secondary select-all leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {data.description}
                </div>
              </div>

              {/* Section 4: Instagram Caption */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Instagram Social Post
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.instagramCaption, 'instagramCaption')}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors uppercase cursor-pointer"
                  >
                    {copiedSection === 'instagramCaption' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-bg-primary border border-border-primary/80 rounded-xl text-xs text-text-secondary select-all leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto">
                  {data.instagramCaption}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-primary/50 bg-bg-secondary/40 shrink-0">
          <div>
            {data && !loading && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-border-primary hover:border-brand-500/50 hover:bg-brand-500/5 rounded-xl text-xs font-bold text-text-secondary hover:text-brand-500 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.txt)</span>
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
