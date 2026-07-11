import React, { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Filter, Sparkles, AlertCircle } from 'lucide-react';

export default function ProductCatalog({ products, cart, onAddToCart, onRemoveFromCart, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetables', 'Fruits', 'Spices', 'Dairy', 'Grains & Oils'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div id="product-catalog-section" className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            id="product-search-input"
            type="text"
            placeholder="Search fresh products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm text-stone-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="h-4 w-4 text-emerald-600 shrink-0 hidden sm:block" />
          <div className="flex gap-1.5">
            {categories.map((category) => (
              <button
                key={category}
                id={`category-btn-${category.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                    : 'bg-stone-50/50 hover:bg-stone-100/80 text-stone-600 border-stone-150'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent mb-4"></div>
          <p className="text-stone-500 text-sm">Loading market catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
            <Search className="h-6 w-6 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold font-display text-stone-800 mb-1">No products found</h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            We couldn't find any products matching "{searchTerm}" in the "{selectedCategory}" category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const cartQty = getCartQuantity(product.id || product._id);
            const isOutOfStock = product.stock <= 0;
            
            return (
              <div
                key={product.id || product._id}
                id={`product-card-${product.id || product._id}`}
                className="group bg-white rounded-3xl border border-stone-100 shadow-xs hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Visual Thumbnail nested compartment style */}
                <div className="m-3 h-44 bg-gradient-to-br from-stone-50 to-emerald-50/10 rounded-2xl relative flex items-center justify-center overflow-hidden border border-stone-100 shadow-inner">
                  <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {product.image && (product.image.startsWith('http') || product.image.includes('/')) ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                  ) : (
                    /* Styled Icon Representation of Product */
                    <div className="p-5 rounded-2xl bg-emerald-50/80 text-emerald-600 transition-all duration-300 group-hover:scale-110 flex items-center justify-center shadow-xs border border-emerald-100/20">
                      <Sparkles className="h-9 w-9 text-emerald-600" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    <span className="px-2 py-0.5 bg-white/95 backdrop-blur-xs border border-stone-150 rounded-lg text-[9px] font-bold font-mono text-stone-500 shadow-2xs uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-white rounded-lg text-[9px] font-bold shadow-sm">
                      Only {product.stock} left
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-rose-600">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-stone-800 group-hover:text-emerald-700 transition-colors text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-wider">Price</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-bold font-mono text-stone-800">₹{product.price}</span>
                        <span className="text-xs font-semibold text-stone-400">/{product.unit}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center">
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 bg-stone-100 text-stone-400 text-xs font-bold rounded-xl border border-stone-200/60 cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : cartQty > 0 ? (
                        <div className="flex items-center bg-emerald-50 rounded-xl border border-emerald-100/60 p-1 gap-1">
                          <button
                            id={`qty-minus-btn-${product.id || product._id}`}
                            onClick={() => onRemoveFromCart(product.id || product._id)}
                            className="p-1 hover:bg-white rounded-lg text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-emerald-800">
                            {cartQty}
                          </span>
                          <button
                            id={`qty-plus-btn-${product.id || product._id}`}
                            onClick={() => onAddToCart(product)}
                            disabled={cartQty >= product.stock}
                            className="p-1 hover:bg-white rounded-lg text-emerald-600 disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`add-to-cart-btn-${product.id || product._id}`}
                          onClick={() => onAddToCart(product)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-emerald-600/10 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
