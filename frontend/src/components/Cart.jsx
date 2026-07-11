import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Lock } from 'lucide-react';

export default function Cart({ cart, onAddToCart, onRemoveFromCart, onClearCart, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above 500 INR
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div id="cart-empty-state" className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-sm max-w-xl mx-auto my-10">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100">
          <ShoppingBag className="h-6 w-6 text-stone-400" />
        </div>
        <h3 className="text-xl font-bold font-display text-stone-800 mb-2">Your cart is empty</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
          Looks like you haven't added anything to your cart yet. Visit our market catalog to discover fresh and healthy products!
        </p>
      </div>
    );
  }

  return (
    <div id="cart-page-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Items List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold font-display text-stone-800">Shopping Cart ({cart.length} items)</h2>
          <button
            id="clear-cart-btn"
            onClick={onClearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Cart
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-xs overflow-hidden divide-y divide-stone-100/60">
          {cart.map((item) => (
            <div
              key={item.productId}
              id={`cart-item-${item.productId}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Product Thumbnail Image */}
                <div className="w-12 h-12 rounded-2xl bg-emerald-50/60 overflow-hidden flex items-center justify-center shrink-0 border border-emerald-100/30">
                  {item.image && (item.image.startsWith('http') || item.image.includes('/')) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold font-display text-stone-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">{item.category}</p>
                  <p className="text-xs font-bold font-mono text-stone-600 sm:hidden mt-1">₹{item.price} / {item.unit}</p>
                </div>
              </div>

              {/* Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6">
                {/* Price hidden on mobile, shown on desktop */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold font-mono text-stone-800">₹{item.price}</p>
                  <p className="text-[10px] font-mono text-stone-400">per {item.unit}</p>
                </div>

                {/* Plus / Minus Quantity Selector */}
                <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-1 gap-1">
                  <button
                    id={`cart-minus-btn-${item.productId}`}
                    onClick={() => onRemoveFromCart(item.productId)}
                    className="p-1 hover:bg-white rounded-lg text-stone-600 transition-colors cursor-pointer"
                  >
                    <Minus className="h-3 w-3 stroke-[2.5]" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-stone-700">
                    {item.quantity}
                  </span>
                  <button
                    id={`cart-plus-btn-${item.productId}`}
                    onClick={() => onAddToCart(item)}
                    className="p-1 hover:bg-white rounded-lg text-stone-600 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 stroke-[2.5]" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right w-20">
                  <p className="text-sm font-bold font-mono text-emerald-700">₹{item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="font-bold font-display text-stone-800 text-base">Price Summary</h3>

          <div className="space-y-3.5 border-b border-stone-100 pb-4 text-sm">
            <div className="flex justify-between text-stone-500 font-medium">
              <span>Subtotal</span>
              <span className="font-bold font-mono text-stone-800">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-500 font-medium">
              <span>Delivery Charges</span>
              <span className="font-bold font-mono text-stone-800">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold font-display">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg p-2 font-medium">
                Add <b>₹{500 - subtotal}</b> more for FREE Delivery!
              </p>
            )}
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold font-display text-stone-800">Total Amount</span>
            <span className="text-2xl font-black font-mono text-emerald-800">₹{total}</span>
          </div>

          <button
            id="proceed-checkout-btn"
            onClick={onCheckout}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/15 transition-all cursor-pointer group"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-center text-[10px] text-stone-400 font-mono">
            <Lock className="h-3 w-3 text-stone-400" />
            <span>Secure 256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
