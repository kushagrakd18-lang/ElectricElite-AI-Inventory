import React, { useMemo, Component } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, Download, AlertTriangle, Package, TrendingUp, IndianRupee } from 'lucide-react';
import useInventory from '../hooks/useInventory';

// ─── Error Boundary (catches silent Recharts/React-is crashes) ────────────────
class ChartErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-rose-400">
          <AlertTriangle className="w-6 h-6" />
          <p className="text-xs font-semibold">Chart render error: {this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}


// ─── Premium Color Palette ────────────────────────────────────────────────────
// Deep blues, indigos, and soft grays that adapt between light & dark themes
const CHART_COLORS = {
  bar: ['#6366f1', '#8b5cf6', '#a78bfa', '#4f46e5', '#818cf8', '#c4b5fd'],
  pie: {
    healthy: '#6366f1',   // Indigo-500 – "In Stock"
    lowStock: '#f43f5e',  // Rose-500  – "Low Stock"
  },
  grid: 'rgba(148,163,184,0.15)',   // Slate-400/15 – subtle
  tickText: '#94a3b8',              // Slate-400
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);

const formatINRShort = (val) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000)   return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-4 py-3 shadow-lg border border-border-primary/60 min-w-[160px]">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold text-text-primary">{formatINR(payload[0].value)}</p>
      <p className="text-[10px] text-text-muted mt-0.5">Total stock value</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass-panel px-4 py-3 shadow-lg border border-border-primary/60">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{name}</p>
      <p className="text-sm font-bold text-text-primary">{value} SKUs</p>
    </div>
  );
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(products) {
  const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Price (INR)', 'Stock (Units)', 'Stock Value (INR)', 'Status'];
  const rows = products.map((p) => {
    const stockValue = p.price * p.stock;
    const status = p.stock < 20 ? 'Low Stock' : 'In Stock';
    return [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand,
      p.category,
      p.price.toFixed(2),
      p.stock,
      stockValue.toFixed(2),
      status,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel INR compat
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `ElectricElite_Inventory_${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconColor, ringColor }) {
  return (
    <div className={`bg-bg-card border border-border-primary/60 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group`}>
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
        {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${iconColor} group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const { products } = useInventory();

  // ── Derived metrics ──
  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 20).length;
    const healthyCount  = total - lowStockCount;

    // Bar chart: total stock value per category
    const categoryMap = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorised';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += p.price * p.stock;
    });
    const barData = Object.entries(categoryMap)
      .map(([category, value]) => ({ category, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Pie chart: Stock vs Low Stock
    const pieData = [
      { name: 'In Stock (≥ 20)', value: healthyCount },
      { name: 'Low Stock (< 20)', value: lowStockCount },
    ].filter(d => d.value > 0);

    return { total, totalValue, lowStockCount, healthyCount, barData, pieData };
  }, [products]);

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ── Page Header with Export Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary m-0">Inventory Analytics</h1>
          <p className="text-text-secondary text-xs mt-0.5">
            Live insights across {stats.total} registered SKUs · Stock valuation in INR (₹)
          </p>
        </div>
        <button
          onClick={() => exportToCSV(products)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/15 hover:shadow-brand-500/25 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report (.csv)
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total SKUs"
          value={stats.total}
          sub="Registered products"
          icon={Package}
          iconColor="bg-indigo-500/10 text-indigo-500"
        />
        <KpiCard
          label="Total Stock Value"
          value={formatINRShort(stats.totalValue)}
          sub={formatINR(stats.totalValue)}
          icon={IndianRupee}
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
        <KpiCard
          label="Healthy Stock"
          value={stats.healthyCount}
          sub="SKUs with ≥ 20 units"
          icon={TrendingUp}
          iconColor="bg-brand-500/10 text-brand-500"
        />
        <KpiCard
          label="Low Stock Alerts"
          value={stats.lowStockCount}
          sub="SKUs with < 20 units"
          icon={AlertTriangle}
          iconColor={stats.lowStockCount > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-text-muted'}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart – Stock Value by Category */}
        <div className="lg:col-span-2 bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Stock Value by Category (₹)</h3>
          </div>

          {stats.barData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-text-muted text-xs">No data available</div>
          ) : (
            <ChartErrorBoundary>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: CHART_COLORS.tickText, fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatINRShort}
                    tick={{ fill: CHART_COLORS.tickText, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                    {stats.barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={CHART_COLORS.bar[index % CHART_COLORS.bar.length]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartErrorBoundary>
          )}

          {/* Category Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border-primary/40">
            {stats.barData.map((entry, index) => (
              <div key={entry.category} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS.bar[index % CHART_COLORS.bar.length] }}
                />
                <span className="text-[10px] font-semibold text-text-muted">{entry.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart – Stock Health Distribution */}
        <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Stock Health</h3>
          </div>

          {stats.pieData.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-text-muted text-xs">No data available</div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={88}
                      innerRadius={48}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                      strokeWidth={0}
                    >
                      <Cell fill={CHART_COLORS.pie.healthy} fillOpacity={0.9} />
                      <Cell fill={CHART_COLORS.pie.lowStock} fillOpacity={0.9} />
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>

              {/* Pie Legend */}
              <div className="w-full space-y-2.5 pt-2 border-t border-border-primary/40">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-text-secondary font-medium">In Stock (≥ 20)</span>
                  </div>
                  <span className="font-bold text-text-primary">{stats.healthyCount} SKUs</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-text-secondary font-medium">Low Stock (&lt; 20)</span>
                  </div>
                  <span className="font-bold text-rose-500">{stats.lowStockCount} SKUs</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Inventory Breakdown Table ── */}
      <div className="bg-bg-card border border-border-primary/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Category Breakdown</h3>
          <span className="text-[10px] text-text-muted">{stats.barData.length} categories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-primary/40 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="py-2 pr-4 font-semibold">Category</th>
                <th className="py-2 pr-4 font-semibold text-right">SKUs</th>
                <th className="py-2 pr-4 font-semibold text-right">Total Stock</th>
                <th className="py-2 font-semibold text-right">Stock Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/30">
              {stats.barData.map((row, idx) => {
                const catProducts = products.filter(p => p.category === row.category);
                const totalStock  = catProducts.reduce((s, p) => s + p.stock, 0);
                return (
                  <tr key={row.category} className="hover:bg-border-secondary/40 transition-colors">
                    <td className="py-2.5 pr-4 font-semibold text-text-primary flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS.bar[idx % CHART_COLORS.bar.length] }}
                      />
                      {row.category}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">{catProducts.length}</td>
                    <td className="py-2.5 pr-4 text-right text-text-secondary">{totalStock.toLocaleString('en-IN')} units</td>
                    <td className="py-2.5 text-right font-semibold text-text-primary">{formatINR(row.value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
