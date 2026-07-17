import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, SlidersHorizontal, PackageOpen, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import useInventory from '../hooks/useInventory';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ContentGeneratorModal from '../components/ContentGeneratorModal';

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Custom Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Add Product handler with success toast
  const handleAddProduct = (newProduct) => {
    addProduct(newProduct);
    showToast(`SKU ${newProduct.id} added successfully!`, 'success');
  };

  // Edit Product handler with success toast
  const handleUpdateProduct = (sku, updatedFields) => {
    updateProduct(sku, updatedFields);
    showToast(`SKU ${sku} updated successfully!`, 'success');
  };

  // Delete Product handler with warning toast
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      showToast(`SKU ${selectedProduct.id} removed from inventory.`, 'error');
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  // Dynamic category list from inventory products
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtering products based on search term (Name/SKU/Brand) and Category
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term);

    const matchesCategory = 
      selectedCategory === 'All' || 
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Helper to format currency (INR localized)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Add SKU Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary m-0">Inventory Catalog</h1>
          <p className="text-text-secondary text-xs mt-0.5">
            Displaying {filteredProducts.length} of {products.length} registered electronic components.
          </p>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all shrink-0"
          title="Register a new catalog component"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-bg-card border border-border-primary/60 rounded-2xl p-4 shadow-sm">
        {/* Search Input */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Product Name, Brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-text-primary"
          />
        </div>

        {/* Category Filter Select */}
        <div className="relative">
          <SlidersHorizontal className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-bg-primary border border-border-primary/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-text-primary appearance-none cursor-pointer"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {/* Custom dropdown caret */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Glassmorphic Table Container */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-primary/60 bg-bg-secondary/40 text-text-muted text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">SKU / ID</th>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Stock Status</th>
                <th className="px-6 py-4 text-right">Unit Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/40 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock < 15;

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-border-secondary/40 transition-colors duration-150 group"
                    >
                      {/* SKU */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-text-primary">
                        {product.id}
                      </td>

                      {/* Product Details (Image + Name & Brand) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border-primary/80"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-border-secondary flex items-center justify-center text-text-muted">
                              📦
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-text-primary leading-tight group-hover:text-brand-500 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-text-muted mt-0.5">
                              by {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-text-secondary border border-border-primary/40">
                          {product.category}
                        </span>
                      </td>

                      {/* Stock Level & Alert Status */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`text-sm font-semibold ${isLowStock ? 'text-rose-500' : 'text-text-primary'}`}>
                            {product.stock} units
                          </span>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-right font-semibold text-text-primary">
                        {formatCurrency(product.price)}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelectedProduct(product); setIsGeneratorOpen(true); }}
                            className="p-1.5 text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all border border-transparent hover:border-indigo-500/20 cursor-pointer"
                            title="Generate AI marketing copy"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedProduct(product); setIsEditOpen(true); }}
                            className="p-1.5 text-text-secondary hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all border border-transparent hover:border-brand-500/20 cursor-pointer"
                            title="Edit component specifications"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedProduct(product); setIsDeleteOpen(true); }}
                            className="p-1.5 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                            title="Remove SKU from catalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty state */
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-text-muted">
                      <PackageOpen className="w-10 h-10 mb-3 text-text-muted/60" />
                      <div className="font-semibold text-sm">No inventory items matched your query</div>
                      <div className="text-xs mt-1">Try resetting search string or selecting another category</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Register Product Dialog Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
        existingProducts={products}
      />

      {/* Edit Product Specifications Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onUpdateProduct={handleUpdateProduct}
      />

      {/* Delete Confirmation Warning Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onConfirm={handleDeleteProduct}
      />

      {/* AI Copywriting Modal */}
      <ContentGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => { setIsGeneratorOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
      />

      {/* Glassmorphic Toast Notification banner */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 glass-panel border px-5 py-3.5 shadow-xl flex items-center gap-2.5 animate-fadeIn ${
          toast.type === 'error' 
            ? 'border-rose-500/25 bg-rose-500/10 text-rose-500' 
            : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
