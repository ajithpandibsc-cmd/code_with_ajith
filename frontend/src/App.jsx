import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, User, LayoutDashboard, Package, RefreshCw, ShoppingBag, Store, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import ProductCatalog from './components/Productcatalog.jsx';
import Cart from './components/Cart.jsx';
import Checkout from './components/Checkout.jsx';
import Login from './components/Login.jsx';
import OrderTracking from './components/OrderTracking.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('market_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('market_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Pages Routing ('catalog', 'cart', 'checkout', 'tracking', 'dashboard', 'login')
  const [currentPage, setCurrentPage] = useState('catalog');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState('');

  // Domain states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('market_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Visual/Loading States
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // Sync states to localstorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('market_token', token);
    } else {
      localStorage.removeItem('market_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('market_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('market_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('market_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch Products
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.ok ? await response.json() : [];
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Orders
  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (token) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [token]);

  // Toast trigger
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Cart Actions ---
  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.productId === (product.id || product._id));
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty >= product.stock) {
      showToast(`Cannot add more. Limit reached for "${product.name}"`, 'error');
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.productId === (product.id || product._id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id || product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category,
        image: product.image,
        quantity: 1
      }]);
    }
    showToast(`Added ${product.name} to cart`);
  };

  const handleRemoveFromCart = (productId) => {
    const existing = cart.find(item => item.productId === productId);
    if (!existing) return;

    if (existing.quantity === 1) {
      setCart(cart.filter(item => item.productId !== productId));
      showToast(`Removed from cart`);
    } else {
      setCart(cart.map(item => 
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Shopping cart cleared');
  };

  // --- Navigation & Routing guards ---
  const handleCheckoutRedirect = () => {
    if (!token) {
      setRedirectAfterLogin('checkout');
      setCurrentPage('login');
      showToast('Please login to place your order', 'error');
    } else {
      setCurrentPage('checkout');
    }
  };

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    showToast(`Logged in successfully! Welcome back, ${newUser.username}`);
    
    if (redirectAfterLogin === 'checkout') {
      setCurrentPage('checkout');
    } else if (newUser.role === 'admin') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('catalog');
    }
    setRedirectAfterLogin('');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setCart([]);
    setCurrentPage('catalog');
    showToast('Logged out successfully');
  };

  const handleOrderPlaced = (newOrder) => {
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCurrentPage('tracking');
    showToast(`Order Placed Successfully! Ref: ${newOrder.orderNumber}`);
  };

  // --- Admin Catalog Sync ---
  const handleProductCreated = (newProduct) => {
    setProducts([newProduct, ...products]);
    showToast(`Product "${newProduct.name}" added to inventory`);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => (p.id === updatedProduct.id || p._id === updatedProduct._id) ? updatedProduct : p));
    showToast(`Product changes synchronized`);
  };

  const handleProductDeleted = (productId) => {
    setProducts(products.filter(p => p.id !== productId && p._id !== productId));
    showToast(`Product removed from catalog`);
  };

  const handleOrderStatusUpdated = (updatedOrder) => {
    setOrders(orders.map(o => (o.id === updatedOrder.id || o._id === updatedOrder._id) ? updatedOrder : o));
    showToast(`Order Status changed to ${updatedOrder.status}`);
  };

  return (
    <div id="application-container" className="min-h-screen bg-stone-50/70 text-stone-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. TOP NAV BAR */}
      <header className="sticky top-0 sm:top-4 z-40 max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-md border-b sm:border border-stone-100 sm:rounded-3xl shadow-sm sm:shadow-md sm:shadow-stone-100/30 px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('catalog')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/15 transition-transform group-hover:scale-105">
              <Store className="h-5 w-5 stroke-[2.25]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-stone-800 text-base sm:text-lg tracking-tight group-hover:text-emerald-700 transition-colors">
                SPA MARKET
              </span>
              <p className="text-[9px] text-stone-400 font-bold font-mono uppercase tracking-widest hidden sm:block">Farm to Doorstep</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-catalog"
              onClick={() => setCurrentPage('catalog')}
              className={`px-2 py-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPage === 'catalog' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'hover:bg-stone-50 text-stone-600 hover:text-stone-800'
              }`}
              title="Browse Market"
            >
              <Store className="h-4 w-4" />
              <span className="hidden md:inline">Browse Market</span>
            </button>

            {user && (
              <button
                id="nav-orders"
                onClick={() => setCurrentPage('tracking')}
                className={`px-2 py-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentPage === 'tracking' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'hover:bg-stone-50 text-stone-600 hover:text-stone-800'
                }`}
                title="Track Orders"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden md:inline">Track Orders</span>
              </button>
            )}

            {user && user.role === 'admin' && (
              <button
                id="nav-dashboard"
                onClick={() => setCurrentPage('dashboard')}
                className={`px-2 py-2 sm:px-3 rounded-xl text-xs font-bold border border-emerald-100 transition-all flex items-center gap-1.5 ${
                  currentPage === 'dashboard' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            )}

            {/* Shopping Cart button */}
            <button
              id="nav-cart"
              onClick={() => setCurrentPage('cart')}
              className={`px-2.5 py-2 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                currentPage === 'cart' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'hover:bg-stone-50 text-stone-600 hover:text-stone-800'
              }`}
              title="My Basket"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline">My Basket</span>
              {cart.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            <span className="w-px h-5 bg-stone-200 mx-0.5 sm:mx-1"></span>

            {/* User Auth block */}
            {user ? (
              <div className="flex items-center gap-1">
                <div className="hidden lg:flex flex-col text-right mr-1.5">
                  <span className="text-xs font-bold text-stone-800 truncate max-w-[100px]">{user.username}</span>
                  <span className="text-[9px] text-stone-400 capitalize font-mono font-bold">{user.role}</span>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login"
                onClick={() => setCurrentPage('login')}
                className="px-2.5 py-2 sm:px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log In"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Log In</span>
              </button>
            )}

          </nav>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-2 sm:mt-6">
        {currentPage === 'catalog' && (
          <ProductCatalog
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            loading={productsLoading}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutRedirect}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            onBackToCart={() => setCurrentPage('cart')}
            onOrderPlaced={handleOrderPlaced}
            token={token}
          />
        )}

        {currentPage === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {currentPage === 'tracking' && (
          <OrderTracking
            orders={orders}
            onRefresh={loadOrders}
            loading={ordersLoading}
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            products={products}
            orders={orders}
            onProductCreated={handleProductCreated}
            onProductUpdated={handleProductUpdated}
            onProductDeleted={handleProductDeleted}
            onOrderStatusUpdated={handleOrderStatusUpdated}
            token={token}
          />
        )}
      </main>

      {/* 3. COHESIVE FOOTER */}
      <footer className="bg-white/80 border-t sm:border border-stone-100 sm:rounded-3xl py-6 text-center text-xs text-stone-400 font-medium sm:mx-6 sm:mb-6 shadow-sm shadow-stone-100/10">
        <p className="font-sans">© 2026 Namma Market E-Commerce. Secured PCI-DSS Integrated. 🌾 <span className="font-semibold text-emerald-600/80">Proudly local, safely delivered.</span></p>
      </footer>

      {/* 4. REAL-TIME INTERACTIVE TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-4.5 py-3 rounded-2xl shadow-lg border text-xs font-bold flex items-center gap-2 bg-stone-900 text-white border-stone-800`}>
            <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
