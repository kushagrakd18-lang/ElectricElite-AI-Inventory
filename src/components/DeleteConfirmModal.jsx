import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, product, onConfirm }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300">
      <div className="w-full max-w-md glass-modal overflow-hidden animate-fadeIn my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary/50 bg-bg-secondary/40">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5 fill-rose-500/10" />
            <h2 className="text-md font-bold">Remove registered SKU</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-primary leading-relaxed font-medium">
            Are you sure you want to delete the product catalog record for:
            <span className="block mt-2 font-bold text-base text-brand-500 bg-brand-500/5 px-3 py-2 rounded-lg border border-brand-500/10">
              {product.name} <span className="font-mono text-xs text-text-muted font-normal">({product.id})</span>
            </span>
          </p>

          <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/20 text-[11px] leading-relaxed text-rose-500">
            ⚠️ <strong>Warning:</strong> This operation deletes all local database tracking parameters immediately. The SKU list re-indexes, and this action cannot be undone.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-primary/50 bg-bg-secondary/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-primary text-xs font-bold text-text-secondary hover:bg-border-secondary hover:text-text-primary transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all"
          >
            Confirm Delete
          </button>
        </div>

      </div>
    </div>
  );
}
