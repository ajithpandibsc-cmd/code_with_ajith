import React, { useState } from 'react';
import { LayoutDashboard, Plus, Edit, Trash2, ArrowRight, Package, TrendingUp, AlertTriangle, FileText, Check, X, RefreshCw, Sparkles, CheckSquare } from 'lucide-react';

export default function Dashboard({ products, orders, onProductCreated, onProductUpdated, onProductDeleted, onOrderStatusUpdated, token }) {
  const [activeTab, setActiveTab] = useState('inventory'); // inventory or orders
  const [isEditing, setIsEditing] = useState(null); // holds product ID being edited or 'new'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Product Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Vegetables',
    stock: '',
    unit: 'kg',
    image: 'carrot'
  });

  // KPI Calculations
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, order) => {
    if (order.paymentStatus === 'Paid' || order.status === 'Delivered') {
      return acc + order.totalAmount;
    }
    return acc;
  }, 0);

  const handleInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const startNewProduct = () => {
    setError('');
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'Vegetables',
      stock: '',
      unit: 'kg',
      image: 'carrot'
    });
    setIsEditing('new');
  };

  const startEditProduct = (product) => {
    setError('');
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      image: product.image || 'carrot'
    });
    setIsEditing(product.id || product._id);
  };

  const cancelForm = () => {
    setIsEditing(null);
    setError('');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productForm.name.trim() || !productForm.description.trim() || 
        productForm.price === '' || productForm.stock === '') {
      setError('Please fill in all product fields.');
      return;
    }

    setLoading(true);

    try {
      const isNew = isEditing === 'new';
      const endpoint = isNew ? '/api/products' : `/api/products/${isEditing}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save product changes.');
      }

      setLoading(false);
      setIsEditing(null);

      if (isNew) {
        onProductCreated(data);
      } else {
        onProductUpdated(data);
      }

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to sync product data.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from the catalog?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product.');
      }

      onProductDeleted(productId);
    } catch (err) {
      alert(err.message || 'Error deleting product.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // payment status updates to Paid if order is delivered or shipped
      const paymentStatus = (newStatus === 'Delivered' || newStatus === 'Shipped') ? 'Paid' : undefined;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, paymentStatus })
      });

      const updatedOrder = await response.json();

      if (!response.ok) {
        throw new Error(updatedOrder.message || 'Failed to update order status.');
      }

      onOrderStatusUpdated(updatedOrder);
    } catch (err) {
      alert(err.message || 'Error changing status.');
    }
  };

  return (
    <div id="seller-dashboard-wrapper" className="space-y-8">
      {/* KPI Stats Grid - Styled as Bento boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-stone-100 rounded-3xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-bold font-mono uppercase tracking-wider">Products list</span>
            <span className="text-lg md:text-2xl font-black font-display text-stone-800">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-3xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100/50">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-bold font-mono uppercase tracking-wider">Low Stock</span>
            <span className="text-lg md:text-2xl font-black font-display text-amber-600">{lowStockProducts}</span>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-3xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
            <FileText className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-bold font-mono uppercase tracking-wider">Total Orders</span>
            <span className="text-lg md:text-2xl font-black font-display text-stone-800">{totalOrders}</span>
          </div>
        </div>

        {/* High-Contrast Standout Bento Block */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-stone-900 border-0 text-white rounded-3xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/15 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/25">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300/80 block font-bold font-mono uppercase tracking-wider">Gross Sales</span>
            <span className="text-lg md:text-2xl font-black font-mono text-white">₹{totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher & Actions */}
      <div className="bg-white rounded-3xl border border-stone-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex gap-1.5 p-1 bg-stone-50 rounded-2xl self-start border border-stone-100">
          <button
            id="tab-btn-inventory"
            onClick={() => { setActiveTab('inventory'); cancelForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Manage Market Inventory
          </button>
          <button
            id="tab-btn-orders"
            onClick={() => { setActiveTab('orders'); cancelForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sales Orders ({totalOrders})
          </button>
        </div>

        {/* Create action */}
        {activeTab === 'inventory' && !isEditing && (
          <button
            id="add-product-init-btn"
            onClick={startNewProduct}
            className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        )}
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-600 font-semibold max-w-xl">
          {error}
        </div>
      )}

      {/* PRODUCT CREATE/EDIT INLINE FORM */}
      {isEditing && (
        <div id="product-editor-panel" className="bg-white border border-emerald-100 shadow-md rounded-3xl p-6 space-y-4">
          <h3 className="font-bold font-display text-stone-800 text-base border-b border-stone-50 pb-2">
            {isEditing === 'new' ? '✨ Add Fresh Market Product' : '✏️ Edit Product Specifications'}
          </h3>

          <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Product Title</label>
              <input
                id="edit-prod-name"
                type="text"
                name="name"
                placeholder="Organic Red Pepper"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={productForm.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Pricing (INR)</label>
              <input
                id="edit-prod-price"
                type="number"
                name="price"
                placeholder="95"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={productForm.price}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Measurement Unit</label>
              <input
                id="edit-prod-unit"
                type="text"
                name="unit"
                placeholder="kg, bundle, liter, packet..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={productForm.unit}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Description</label>
              <textarea
                id="edit-prod-desc"
                name="description"
                rows="2"
                placeholder="Nutrient details, harvest origins, farm details..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={productForm.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Market Category</label>
              <select
                id="edit-prod-category"
                name="category"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 bg-white transition-all cursor-pointer"
                value={productForm.category}
                onChange={handleInputChange}
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Spices">Spices</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains & Oils">Grains & Oils</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Inventory Quantity Available</label>
              <input
                id="edit-prod-stock"
                type="number"
                name="stock"
                placeholder="100"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                value={productForm.stock}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Visual Icon (Theme decoration)</label>
              <select
                id="edit-prod-image"
                name="image"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 bg-white transition-all cursor-pointer"
                value={productForm.image}
                onChange={handleInputChange}
              >
                <option value="carrot">Carrot</option>
                <option value="apple">Apple</option>
                <option value="leaf">Leafy Greens</option>
                <option value="milk">Dairy Bottle</option>
                <option value="droplet">Grains/Oil Drops</option>
                <option value="sparkles">Fancy Spices</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3.5 pt-4 border-t border-stone-100">
              <button
                id="editor-cancel-btn"
                type="button"
                onClick={cancelForm}
                className="px-4.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-500 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                id="editor-save-btn"
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Product specifications'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: INVENTORY PRODUCTS LISTING */}
      {activeTab === 'inventory' && !isEditing && (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          
          {/* Mobile view: Card list */}
          <div className="block md:hidden divide-y divide-stone-100">
            {products.map((product) => (
              <div 
                key={product.id || product._id} 
                id={`dash-card-${product.id || product._id}`}
                className="p-5 space-y-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm font-display">{product.name}</h4>
                    <p className="text-xs text-stone-400 line-clamp-2 mt-0.5">{product.description}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-stone-50 border border-stone-150 text-stone-500 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider shrink-0">
                    {product.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-stone-50/50 rounded-2xl p-3.5 border border-stone-100 text-xs">
                  <div>
                    <p className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-wider">Price</p>
                    <p className="font-bold text-emerald-800 font-mono mt-0.5">₹{product.price} / {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-wider">Stock level</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-600 font-bold' : 'text-stone-700'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    id={`edit-prod-mobile-btn-${product.id || product._id}`}
                    onClick={() => startEditProduct(product)}
                    className="flex-1 py-2 border border-stone-100 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Specifications</span>
                  </button>
                  <button
                    id={`del-prod-mobile-btn-${product.id || product._id}`}
                    onClick={() => handleDeleteProduct(product.id || product._id)}
                    className="flex-1 py-2 border border-rose-50 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-stone-500">
              <thead className="bg-stone-50 text-xs font-bold text-stone-600 uppercase border-b border-stone-100 font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-display font-bold">Product Specs</th>
                  <th className="px-6 py-4 font-display font-bold">Category</th>
                  <th className="px-6 py-4 font-display font-bold">Price</th>
                  <th className="px-6 py-4 font-display font-bold">Stock level</th>
                  <th className="px-6 py-4 text-right font-display font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {products.map((product) => (
                  <tr key={product.id || product._id} id={`dash-row-${product.id || product._id}`} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-stone-800 text-sm font-display">{product.name}</p>
                        <p className="text-xs text-stone-400 line-clamp-1">{product.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase text-stone-500 font-mono">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-emerald-800 font-mono">₹{product.price} / {product.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-600 font-bold' : 'text-stone-700'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          id={`edit-prod-btn-${product.id || product._id}`}
                          onClick={() => startEditProduct(product)}
                          className="p-2 border border-stone-100 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-800 rounded-xl transition-colors cursor-pointer shadow-2xs"
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`del-prod-btn-${product.id || product._id}`}
                          onClick={() => handleDeleteProduct(product.id || product._id)}
                          className="p-2 border border-rose-50 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INCOMING SALES ORDERS LISTING */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-sm">
              <Package className="h-8 w-8 text-stone-400 mx-auto mb-3" />
              <h4 className="font-bold font-display text-stone-800 text-sm">No sales orders received yet</h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                Your store currently has zero orders. Tell customers to register and place checkout orders!
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id || order._id}
                id={`dash-order-log-${order.orderNumber}`}
                className="bg-white border border-stone-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-stone-200/80 transition-all duration-300 flex flex-col lg:flex-row gap-6 justify-between"
              >
                {/* Left metadata */}
                <div className="space-y-3.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold font-display text-stone-800 text-base">{order.orderNumber}</span>
                    <span className="text-xs text-stone-400 font-bold font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/55' : 'bg-amber-50 text-amber-700 border border-amber-100/55'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                    Customer: <span className="text-stone-800 font-display font-bold">{order.customerName}</span> <br />
                    Shipping: <span className="text-stone-800">{order.shippingAddress}</span>
                  </p>

                  {/* Items summary */}
                  <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 text-xs text-stone-600 max-w-xl">
                    <p className="font-bold font-mono text-stone-400 uppercase text-[9px] mb-2 tracking-widest">Products list</p>
                    <div className="space-y-1.5 divide-y divide-stone-100/50">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between font-medium pt-1.5 first:pt-0">
                          <span>{item.name} <b className="text-stone-400 font-mono">x{item.quantity}</b></span>
                          <span className="font-bold font-mono text-stone-700">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-4 shrink-0 lg:border-l lg:border-stone-100 lg:pl-6">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-stone-400 block font-bold font-mono uppercase tracking-wider">Order Subtotal</span>
                    <span className="text-xl font-bold font-mono text-emerald-800">₹{order.totalAmount}</span>
                    <span className="text-[10px] text-stone-400 block font-semibold">via {order.paymentMethod}</span>
                  </div>

                  {/* Dropdown status changer */}
                  <div className="space-y-1 self-start sm:self-auto lg:self-auto w-full max-w-[200px]">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1 font-mono tracking-wider">
                      Update Logistic Stage
                    </label>
                    <select
                      id={`dash-order-status-select-${order.orderNumber}`}
                      className="w-full bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl p-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all cursor-pointer"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id || order._id, e.target.value)}
                    >
                      <option value="Pending">Pending Validation</option>
                      <option value="Paid">Confirmed (Paid)</option>
                      <option value="Processing">Processing & Packing</option>
                      <option value="Shipped">Dispatched (Out for Delivery)</option>
                      <option value="Delivered">Delivered Successfully</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
