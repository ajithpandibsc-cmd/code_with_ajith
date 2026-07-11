import React, { useState } from 'react';
import { Package, Clock, ShieldCheck, MapPin, Search, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, Truck, Check } from 'lucide-react';

export default function OrderTracking({ orders, onRefresh, loading }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Paid': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const getTimelineStep = (status) => {
    const steps = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  const timelineSteps = [
    { label: 'Order Placed', desc: 'Received by market' },
    { label: 'Confirmed', desc: 'Securely Verified' },
    { label: 'Processing', desc: 'Weighing & Packing' },
    { label: 'Dispatched', desc: 'Out for Delivery' },
    { label: 'Delivered', desc: 'Arrived at your door' }
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100 shadow-xs">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-stone-500">Loading order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div id="no-orders-container" className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-sm max-w-xl mx-auto my-10">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100">
          <Package className="h-6 w-6 text-stone-400" />
        </div>
        <h3 className="text-xl font-bold font-display text-stone-800 mb-2">No orders placed yet</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
          You haven't placed any orders in our market. Browse the product catalog to purchase fresh vegetables, fruits, and spices!
        </p>
        <button
          id="refresh-orders-empty-btn"
          onClick={onRefresh}
          className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Orders
        </button>
      </div>
    );
  }

  return (
    <div id="order-tracking-list-wrapper" className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold font-display text-stone-800">My Market Orders</h2>
          <p className="text-xs text-stone-500">View real-time delivery tracking & order records</p>
        </div>
        <button
          id="refresh-orders-btn"
          onClick={onRefresh}
          className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Logs
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id || expandedOrder === order._id;
          const currentStep = getTimelineStep(order.status);
          
          return (
            <div
              key={order.id || order._id}
              id={`order-log-item-${order.orderNumber}`}
              className="bg-white rounded-3xl border border-stone-100 shadow-xs overflow-hidden hover:border-stone-200 transition-all"
            >
              {/* Header block (always visible) */}
              <div
                onClick={() => toggleExpand(order.id || order._id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/30">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-display text-stone-800 text-sm">{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                      Placed on: {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-stone-100/60 pt-2.5 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-stone-400">Total Price</p>
                    <p className="text-sm font-extrabold font-mono text-emerald-800">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <span className="text-xs font-bold text-stone-500 hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Expansion block */}
              {isExpanded && (
                <div className="border-t border-stone-100 p-5 space-y-6 bg-stone-50/20">
                  
                  {/* Delivery Visual Progress Tracker */}
                  <div className="py-4 px-2 md:px-6">
                    <div className="relative flex items-center justify-between">
                      {/* Grey horizontal bar */}
                      <div className="absolute left-0 right-0 h-0.5 bg-stone-200 top-4 -z-10"></div>
                      
                      {/* Active green progress bar */}
                      <div 
                        className="absolute left-0 h-0.5 bg-emerald-600 top-4 -z-10 transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentStep) / (timelineSteps.length - 1)) * 100}%` }}
                      ></div>

                      {/* Timeline Nodes */}
                      {timelineSteps.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isActive = index === currentStep;
                        
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 text-center">
                            <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isCompleted 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-600/20' 
                                : 'bg-white border-stone-200 text-stone-400'
                            }`}>
                              {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : index + 1}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 ${isActive ? 'text-emerald-700' : isCompleted ? 'text-stone-700' : 'text-stone-400'}`}>
                              {step.label}
                            </span>
                            <span className="text-[9px] text-stone-400 hidden sm:block mt-0.5 font-medium">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details & Summary columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Items table */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold font-mono text-stone-500 uppercase tracking-wider">Ordered items</h4>
                      <div className="divide-y divide-stone-50">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex justify-between text-xs font-medium">
                            <div>
                              <span className="font-bold font-display text-stone-800">{item.name}</span>
                              <span className="text-stone-400 font-mono ml-1.5">x{item.quantity}</span>
                            </div>
                            <span className="font-bold font-mono text-stone-700">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Logistics */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3.5 shadow-2xs text-xs">
                      <h4 className="text-xs font-bold font-mono text-stone-500 uppercase tracking-wider">Delivery Logistics</h4>
                      
                      <div className="space-y-3">
                        <div className="flex gap-2.5 items-start">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-stone-500 font-mono uppercase tracking-wider text-[10px]">Shipping Destination</p>
                            <p className="text-stone-700 mt-0.5 leading-relaxed font-semibold">{order.shippingAddress}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-start">
                          <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-stone-500 font-mono uppercase tracking-wider text-[10px]">Payment Status</p>
                            <p className="text-stone-700 mt-0.5 font-bold uppercase tracking-wider font-mono">
                              {order.paymentMethod} • <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-500'}>{order.paymentStatus}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
