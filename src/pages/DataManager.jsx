import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Download, FileText, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, Table2, Eye, Trash2, Plus, Info
} from 'lucide-react';
import useInventory from '../hooks/useInventory';

// ─── CSV Parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    cols.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

// ─── Map CSV row → product object ─────────────────────────────────────────────
function rowToProduct(row) {
  return {
    id: row['SKU'] || row['id'] || `SKU-IMP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    name: row['Product Name'] || row['name'] || 'Unnamed Product',
    brand: row['Brand'] || row['brand'] || 'Unknown',
    category: row['Category'] || row['category'] || 'General',
    price: parseFloat(row['Price (INR)'] || row['price'] || '0') || 0,
    stock: parseInt(row['Stock (Units)'] || row['stock'] || '0', 10) || 0,
    barcode: row['Barcode'] || row['barcode'] || '',
    image: row['Image URL'] || row['image'] || '',
    specs: {}
  };
}

// ─── CSV Export ────────────────────────────────────────────────────────────────
function exportToCSV(products) {
  const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Price (INR)', 'Stock (Units)', 'Barcode', 'Image URL', 'Stock Value (INR)', 'Status'];
  const rows = products.map(p => {
    const stockValue = p.price * p.stock;
    const status = p.stock < 20 ? 'Low Stock' : 'In Stock';
    return [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.price.toFixed(2),
      p.stock,
      p.barcode || '',
      p.image || '',
      stockValue.toFixed(2),
      status,
    ].join(',');
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ElectricElite_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Sample CSV Download ────────────────────────────────────────────────────────
function downloadSampleCSV() {
  const sample = [
    'SKU,Product Name,Brand,Category,Price (INR),Stock (Units),Barcode,Image URL',
    'SKU-SAMPLE-001,"Philips 9W LED Bulb",Philips,LED Bulbs,149.00,100,8901234567890,',
    'SKU-SAMPLE-002,"Havells 6-Socket Surge Guard",Havells,Extension Boards,1299.00,50,8901234567891,',
    'SKU-SAMPLE-003,"Orient BLDC Fan 48inch",Orient Electric,Ceiling Fans,4999.00,25,8901234567892,',
  ].join('\n');
  const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ElectricElite_Sample_Import.csv';
  link.click();
  URL.revokeObjectURL(url);
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DataManager() {
  const { products, addBulkProducts, importProducts } = useInventory();

  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState(null);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'
  const [importResult, setImportResult] = useState(null); // { added, skipped, total }
  const [previewPage, setPreviewPage] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const ROWS_PER_PAGE = 8;

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Only .csv files are supported. Please upload a valid CSV file.');
      return;
    }
    setError('');
    setImportResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { rows } = parseCSV(e.target.result);
      if (rows.length === 0) {
        setError('The CSV file appears to be empty or has no data rows.');
        setParsedRows(null);
        return;
      }
      setParsedRows(rows);
      setPreviewPage(0);
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);

  const handleImport = () => {
    if (!parsedRows || parsedRows.length === 0) return;
    const newProducts = parsedRows.map(rowToProduct);
    if (importMode === 'replace') {
      importProducts(newProducts);
      setImportResult({ added: newProducts.length, skipped: 0, total: newProducts.length, mode: 'replace' });
    } else {
      // addBulkProducts returns synchronously approximated; use a manual count
      const existingIds = new Set(products.map(p => p.id));
      let added = 0, skipped = 0;
      const toAdd = [];
      newProducts.forEach(p => {
        if (existingIds.has(p.id)) { skipped++; } else { toAdd.push(p); added++; }
      });
      addBulkProducts(toAdd.length > 0 ? toAdd : []);
      setImportResult({ added, skipped, total: newProducts.length, mode: 'append' });
    }
    setParsedRows(null);
    setFileName('');
  };

  const clearPreview = () => {
    setParsedRows(null);
    setFileName('');
    setImportResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pagedRows = parsedRows
    ? parsedRows.slice(previewPage * ROWS_PER_PAGE, (previewPage + 1) * ROWS_PER_PAGE)
    : [];
  const totalPages = parsedRows ? Math.ceil(parsedRows.length / ROWS_PER_PAGE) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary m-0">Data Manager</h1>
          <p className="text-text-secondary text-xs mt-0.5">
            Import inventory via CSV or export the full catalog — {products.length} SKUs currently loaded.
          </p>
        </div>
        <button
          onClick={() => exportToCSV(products)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/15 hover:shadow-brand-500/25 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Full Catalog (.csv)
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: products.length, color: 'text-brand-500 bg-brand-500/10' },
          { label: 'Total Stock Value', value: formatCurrency(products.reduce((s, p) => s + p.price * p.stock, 0)), color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Low Stock (< 20)', value: products.filter(p => p.stock < 20).length, color: 'text-rose-500 bg-rose-500/10' },
          { label: 'Categories', value: new Set(products.map(p => p.category)).size, color: 'text-indigo-500 bg-indigo-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-bg-card border border-border-primary/60 rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`text-xl font-bold ${stat.color.split(' ')[0]}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Import Section (col-span-3) ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Upload className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Import from CSV</h3>
            </div>

            {/* Import mode toggle */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-text-muted font-medium">Import Mode:</span>
              <div className="flex rounded-xl overflow-hidden border border-border-primary/60">
                {[['append', 'Append (Merge)'], ['replace', 'Replace All']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setImportMode(val)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                      importMode === val
                        ? 'bg-brand-500 text-white'
                        : 'bg-bg-primary text-text-secondary hover:bg-border-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-text-muted cursor-help" />
                <div className="absolute left-5 top-0 z-10 hidden group-hover:block w-52 p-2.5 rounded-xl bg-bg-card border border-border-primary/60 shadow-xl text-[10px] text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Append:</strong> Adds new SKUs; skips any with a duplicate ID.<br />
                  <strong className="text-text-primary">Replace All:</strong> Wipes existing inventory and loads CSV data.
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            {!parsedRows && (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-brand-500 bg-brand-500/5 scale-[1.01]'
                    : 'border-border-primary/60 hover:border-brand-500/50 hover:bg-brand-500/[0.02]'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragActive ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-500'}`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">
                    {dragActive ? 'Drop your CSV file here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Only .csv files — UTF-8 encoded</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-500">
                <XCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows && parsedRows.length > 0 && (
              <div className="space-y-4">
                {/* File info bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-semibold text-text-primary">{fileName}</span>
                    <span className="text-text-muted">— {parsedRows.length} rows detected</span>
                  </div>
                  <button onClick={clearPreview} className="p-1 text-text-muted hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview rows */}
                <div className="overflow-x-auto rounded-xl border border-border-primary/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-bg-secondary/60">
                      <tr className="border-b border-border-primary/60 text-text-muted uppercase tracking-wider text-[10px]">
                        {['SKU / id', 'Product Name', 'Brand', 'Category', 'Price (₹)', 'Stock'].map(h => (
                          <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary/40">
                      {pagedRows.map((row, i) => {
                        const p = rowToProduct(row);
                        return (
                          <tr key={i} className="hover:bg-border-secondary/30 transition-colors">
                            <td className="px-3 py-2 font-mono font-semibold text-text-primary whitespace-nowrap">{p.id}</td>
                            <td className="px-3 py-2 text-text-secondary max-w-[180px] truncate">{p.name}</td>
                            <td className="px-3 py-2 text-text-muted">{p.brand}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary border border-border-primary/40 text-[10px]">{p.category}</span>
                            </td>
                            <td className="px-3 py-2 font-semibold text-emerald-500">{formatCurrency(p.price)}</td>
                            <td className={`px-3 py-2 font-semibold ${p.stock < 20 ? 'text-rose-500' : 'text-text-primary'}`}>{p.stock}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Showing rows {previewPage * ROWS_PER_PAGE + 1}–{Math.min((previewPage + 1) * ROWS_PER_PAGE, parsedRows.length)} of {parsedRows.length}</span>
                    <div className="flex gap-1">
                      <button
                        disabled={previewPage === 0}
                        onClick={() => setPreviewPage(p => p - 1)}
                        className="px-2 py-1 rounded-lg border border-border-primary/60 hover:bg-border-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >← Prev</button>
                      <button
                        disabled={previewPage >= totalPages - 1}
                        onClick={() => setPreviewPage(p => p + 1)}
                        className="px-2 py-1 rounded-lg border border-border-primary/60 hover:bg-border-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >Next →</button>
                    </div>
                  </div>
                )}

                {/* Import action bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border-primary/40">
                  <span className="text-[11px] text-text-muted">
                    Mode: <strong className="text-text-primary capitalize">{importMode}</strong>
                    {importMode === 'replace' && <span className="text-rose-500 ml-1">(will overwrite all existing data)</span>}
                  </span>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/15 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Confirm Import ({parsedRows.length} rows)
                  </button>
                </div>
              </div>
            )}

            {/* Import Result Banner */}
            {importResult && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8 mt-4">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-500">Import Successful!</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {importResult.mode === 'replace'
                      ? `Replaced entire inventory with ${importResult.added} products.`
                      : `Added ${importResult.added} new SKUs. ${importResult.skipped > 0 ? `Skipped ${importResult.skipped} duplicate(s).` : ''}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Export & Guide (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Export Card */}
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Export Options</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => exportToCSV(products)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-primary/60 bg-bg-primary/50 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">Full Inventory Export</span>
                    <span className="text-[10px] text-text-muted">{products.length} SKUs → .csv (Excel compatible)</span>
                  </div>
                </div>
              </button>

              <button
                onClick={downloadSampleCSV}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-primary/60 bg-bg-primary/50 hover:border-brand-500/40 hover:bg-brand-500/5 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">Download Sample CSV</span>
                    <span className="text-[10px] text-text-muted">3 sample rows to guide your import</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CSV Column Format Guide */}
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Table2 className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">CSV Column Guide</h3>
            </div>
            <div className="space-y-2">
              {[
                { col: 'SKU', type: 'string', req: true, desc: 'Unique product ID (e.g. SKU-LED-001)' },
                { col: 'Product Name', type: 'string', req: true, desc: 'Full product name' },
                { col: 'Brand', type: 'string', req: true, desc: 'Manufacturer / brand' },
                { col: 'Category', type: 'string', req: true, desc: 'Product category group' },
                { col: 'Price (INR)', type: 'number', req: true, desc: 'Unit price in Indian Rupees' },
                { col: 'Stock (Units)', type: 'integer', req: true, desc: 'Current stock quantity' },
                { col: 'Barcode', type: 'string', req: false, desc: 'EAN / barcode (optional)' },
                { col: 'Image URL', type: 'string', req: false, desc: 'HTTPS image URL (optional)' },
              ].map(({ col, type, req, desc }) => (
                <div key={col} className="flex items-start gap-2.5 py-1.5 border-b border-border-primary/30 last:border-0">
                  <code className="text-[10px] font-mono font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded shrink-0">{col}</code>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-text-secondary">{desc}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted border border-border-primary/30">{type}</span>
                    {req
                      ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">req</span>
                      : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted border border-border-primary/30">opt</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current inventory snapshot */}
          <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Inventory Snapshot</h3>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {products.slice(0, 20).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1 border-b border-border-primary/20 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-text-muted shrink-0">{p.id}</span>
                    <span className="text-xs text-text-secondary truncate">{p.name}</span>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ml-2 ${p.stock < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {p.stock}u
                  </span>
                </div>
              ))}
              {products.length > 20 && (
                <p className="text-[10px] text-text-muted text-center pt-1">+{products.length - 20} more SKUs · Export to view all</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
