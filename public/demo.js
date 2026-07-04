// StockFlows Interactive Demo
const { SHOP, LOCATIONS, VENDORS, PRODUCTS, PURCHASE_ORDERS, STOCK_MOVEMENTS, ALERTS, FORECASTS, STATS } = window.DEMO_DATA;

// --- Utility Functions ---
function fmt(n) { return n.toLocaleString(); }
function fmtM(n) { return '$' + n.toFixed(2); }

function getProductName(id) {
  for (const p of PRODUCTS) {
    for (const v of p.variants) {
      if (v.id === id) return `${p.title} — ${v.title}`;
    }
  }
  return id;
}

function getVendorName(id) {
  return VENDORS.find(v => v.id === id)?.name || id;
}

// --- Navigation ---
function initNavigation() {
  document.querySelectorAll('.demo-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      document.querySelectorAll('.demo-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.demo-page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${page}`).classList.add('active');
    });
  });
}

// --- Dashboard ---
function renderDashboard() {
  document.getElementById('dashboard-stats').innerHTML = `
    <div class="demo-stat-card"><div class="demo-stat-label">Total SKUs</div><div class="demo-stat-value blue">${STATS.totalSKUs}</div></div>
    <div class="demo-stat-card"><div class="demo-stat-label">Inventory Value</div><div class="demo-stat-value">${fmtM(STATS.totalValue)}</div></div>
    <div class="demo-stat-card"><div class="demo-stat-label">Low Stock Items</div><div class="demo-stat-value red">${STATS.lowStockCount}</div></div>
    <div class="demo-stat-card"><div class="demo-stat-label">Out of Stock</div><div class="demo-stat-value red">${STATS.outOfStockCount}</div></div>
    <div class="demo-stat-card"><div class="demo-stat-label">Open POs</div><div class="demo-stat-value">${STATS.openPOs}</div></div>
    <div class="demo-stat-card"><div class="demo-stat-label">Pending Alerts</div><div class="demo-stat-value">${STATS.pendingAlerts}</div></div>
  `;

  document.getElementById('recent-activity').innerHTML = STOCK_MOVEMENTS.slice(0, 6).map(m => {
    const icon = m.type === 'SALE' ? 'point_of_sale' : m.type === 'RETURN' ? 'replay' : m.type === 'RECEIVING' ? 'local_shipping' : m.type === 'ADJUSTMENT' ? 'edit' : m.type.startsWith('TRANSFER') ? 'swap_horiz' : 'inventory';
    return `<div class="demo-activity-item"><div class="demo-activity-icon"><span class="material-symbols-outlined">${icon}</span></div><div class="demo-activity-text"><strong>${m.type.replace('_', ' ')}</strong> — ${getProductName(m.productId)}</div><div class="demo-activity-time">${m.qty > 0 ? '+' : ''}${m.qty} units</div></div>`;
  }).join('');

  document.getElementById('low-stock-alerts').innerHTML = ALERTS.map(a => `
    <div class="demo-alert-item"><div class="demo-alert-dot ${a.urgency.toLowerCase()}"></div><div class="demo-alert-text">${getProductName(a.productId)}</div><div class="demo-alert-qty">${a.currentStock} / ${a.reorderPoint}</div></div>
  `).join('');
}

// --- Inventory ---
function renderInventory() {
  const rows = [];
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      const status = variant.qty === 0 ? 'out-of-stock' : variant.qty <= variant.reorderPoint ? 'low-stock' : 'in-stock';
      const statusLabel = status === 'out-of-stock' ? 'Out of Stock' : status === 'low-stock' ? 'Low Stock' : 'In Stock';
      rows.push(`<tr data-search="${product.title} ${variant.title} ${product.sku}"><td><strong>${product.title}</strong><br><span style="color:#666;font-size:0.75rem">${variant.title}</span></td><td><code style="font-size:0.8rem">${product.sku}</code></td><td>Main Warehouse</td><td><strong>${variant.qty}</strong></td><td>${variant.reorderPoint}</td><td><span class="demo-status ${status}">${statusLabel}</span></td><td>${fmtM(variant.qty * product.cost)}</td></tr>`);
    }
  }
  document.getElementById('inventory-tbody').innerHTML = rows.join('');
  document.getElementById('inventory-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#inventory-tbody tr').forEach(row => {
      row.style.display = row.dataset.search.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

// --- Purchasing ---
function renderPurchasing() {
  document.getElementById('po-tbody').innerHTML = PURCHASE_ORDERS.map(po => {
    const total = po.items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const statusClass = po.status.toLowerCase().replace('_', '-');
    return `<tr><td><strong>${po.number}</strong></td><td>${getVendorName(po.vendorId)}</td><td><span class="demo-status ${statusClass}">${po.status.replace('_', ' ')}</span></td><td>${po.items.length} items</td><td>${fmtM(total)}</td><td>${po.expectedDate}</td></tr>`;
  }).join('');
}

// --- Forecasting ---
function renderForecasting() {
  document.getElementById('forecast-cards').innerHTML = FORECASTS.map(f => {
    const bars = Array.from({length: 30}, (_, i) => {
      const height = Math.max(10, ((Math.sin(i * 0.3) * 0.3 + 0.7) * f.dailyAvg / 10) * 100);
      return `<div class="demo-forecast-bar ${i >= 20 ? 'predicted' : ''}" style="height:${height}%"></div>`;
    }).join('');
    return `<div class="demo-forecast-card"><div class="demo-forecast-header"><div class="demo-forecast-product">${getProductName(f.productId)}</div><div class="demo-forecast-model">${f.model}</div></div><div class="demo-forecast-chart">${bars}</div><div class="demo-forecast-stats"><span>Avg: <strong>${f.dailyAvg}/day</strong></span><span>Trend: <strong>${f.trend}</strong></span><span>Confidence: <strong>${(f.confidence * 100).toFixed(0)}%</strong></span></div></div>`;
  }).join('');
}

// --- Reports ---
function renderReports() {
  document.getElementById('valuation-report').innerHTML = PRODUCTS.map(p => {
    const totalQty = p.variants.reduce((s, v) => s + v.qty, 0);
    return `<div class="demo-report-row"><span>${p.title}</span><span>${fmt(totalQty)} units — ${fmtM(totalQty * p.cost)}</span></div>`;
  }).join('') + `<div class="demo-report-row" style="font-weight:600;margin-top:8px;padding-top:8px;border-top:2px solid var(--border)"><span>Total Inventory Value</span><span class="demo-report-total">${fmtM(STATS.totalValue)}</span></div>`;

  const movementTypes = {};
  STOCK_MOVEMENTS.forEach(m => { if (!movementTypes[m.type]) movementTypes[m.type] = 0; movementTypes[m.type] += Math.abs(m.qty); });
  document.getElementById('movement-report').innerHTML = Object.entries(movementTypes).map(([type, qty]) => `<div class="demo-report-row"><span>${type.replace('_', ' ')}</span><span>${qty} units</span></div>`).join('');
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderDashboard();
  renderInventory();
  renderPurchasing();
  renderForecasting();
  renderReports();
});
