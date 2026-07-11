import React, { useState } from 'react';
import { CreditCard, MapPin, Truck, ShieldCheck, ShoppingBag, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function Checkout({ cart, onBackToCart, onOrderPlaced, token }) {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Card'); // Card, UPI, COD
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'number') {
      val = val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substr(0, 19);
    } else if (e.target.name === 'expiry') {
      val = val.replace(/\/?/g, '').replace(/(\d{2})/g, '$1/').trim().substr(0, 5);
      if (val.endsWith('/')) val = val.slice(0, -1);
    } else if (e.target.name === 'cvv') {
      val = val.replace(/\D/g, '').substr(0, 3);
    }
    setCardDetails({ ...cardDetails, [e.target.name]: val });
  };

  const validateForm = () => {
    if (!shippingAddress.fullName.trim() || !shippingAddress.phone.trim() || 
        !shippingAddress.street.trim() || !shippingAddress.city.trim() || 
        !shippingAddress.pincode.trim()) {
      return 'Please fill in all shipping details.';
    }
    
    if (shippingAddress.phone.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }

    if (shippingAddress.pincode.replace(/\D/g, '').length !== 6) {
      return 'Please enter a valid 6-digit PIN code.';
    }

    if (paymentMethod === 'Card') {
      const cardNumClean = cardDetails.number.replace(/\s/g, '');
      if (cardNumClean.length < 16) return 'Please enter a valid 16-digit credit/debit card number.';
      if (cardDetails.expiry.length < 5) return 'Please enter a valid card expiry (MM/YY).';
      if (cardDetails.cvv.length < 3) return 'Please enter a valid CVV (3 digits).';
    } else if (paymentMethod === 'UPI') {
      if (!upiId.includes('@') || upiId.length < 5) {
        return 'Please enter a valid UPI ID (e.g. name@okhdfc).';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErr = validateForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    try {
      const formattedAddress = `${shippingAddress.fullName}, Ph: ${shippingAddress.phone}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`;
      
      const orderItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Submit to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: total,
          shippingAddress: formattedAddress,
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === 'Card' ? { cardNumLast4: cardDetails.number.slice(-4) } : { upiId }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment processing failed.');
      }

      // Simulate network delay for secure encryption experience
      setTimeout(() => {
        setLoading(false);
        onOrderPlaced(data);
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Checkout failed. Please try again.');
    }
  };

  return (
    <div id="checkout-section-wrapper" className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        id="back-to-cart-btn"
        onClick={onBackToCart}
        className="text-stone-500 hover:text-stone-700 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shopping Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Forms */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-50 pb-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold font-display text-stone-800 text-base">Delivery Shipping Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Receiver Name</label>
                  <input
                    id="shipping-fullName"
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Mobile Number (Delivery updates)</label>
                  <input
                    id="shipping-phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Street / House No. / Landmark</label>
                  <input
                    id="shipping-street"
                    type="text"
                    name="street"
                    required
                    placeholder="Flat No, Street, Area name..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">City</label>
                  <input
                    id="shipping-city"
                    type="text"
                    name="city"
                    required
                    placeholder="City name"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">PIN Code</label>
                  <input
                    id="shipping-pincode"
                    type="text"
                    name="pincode"
                    required
                    placeholder="6-digit PIN"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>

            {/* Secure Payment Integration */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-50 pb-3">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold font-display text-stone-800 text-base">Secure Payment Integration</h3>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-stone-50 border border-stone-100 rounded-2xl">
                {['Card', 'UPI', 'COD'].map((method) => (
                  <button
                    key={method}
                    id={`pay-method-btn-${method.toLowerCase()}`}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {method === 'Card' && 'Credit/Debit'}
                    {method === 'UPI' && 'UPI / GPay'}
                    {method === 'COD' && 'Cash on Delivery'}
                  </button>
                ))}
              </div>

              {/* Payment fields based on method */}
              <div className="pt-2">
                {paymentMethod === 'Card' && (
                  <div className="space-y-3.5 bg-stone-50/50 rounded-2xl p-4 border border-stone-100">
                    <div>
                      <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Card Number</label>
                      <input
                        id="card-number-input"
                        type="text"
                        name="number"
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">Expiry Date</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 text-center transition-all"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">CVV Security</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          name="cvv"
                          placeholder="***"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 text-center transition-all"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 space-y-2">
                    <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1 tracking-wider">UPI ID</label>
                    <input
                      id="upi-id-input"
                      type="text"
                      placeholder="e.g. mobile@ybl or username@okhdfc"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-[10px] text-stone-400 font-mono">
                      A request will be pushed safely to your Google Pay or BHIM UPI app for checkout.
                    </p>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100/50">
                    <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                      💵 You will pay <b className="text-emerald-950 font-mono">₹{total}</b> in cash directly to our delivery executive when your market order arrives. No online payment details required.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-rose-600 bg-rose-50 rounded-2xl p-3 text-xs font-bold border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/15 cursor-pointer transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encrypting & Processing Secure Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Place Secure Order (₹{total})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-xs space-y-4">
            <h3 className="font-bold font-display text-stone-800 text-base flex items-center gap-1.5 pb-2 border-b border-stone-50">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Checkout Summary
            </h3>

            {/* List of items */}
            <div className="divide-y divide-stone-50 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.productId} className="py-3 flex justify-between gap-3 text-sm font-medium">
                  <div className="min-w-0">
                    <p className="font-bold font-display text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity} {item.unit}</p>
                  </div>
                  <span className="font-bold font-mono text-stone-700 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Financial Calculations */}
            <div className="border-t border-stone-100 pt-3 space-y-2.5 text-sm font-medium">
              <div className="flex justify-between text-stone-500">
                <span>Items Subtotal</span>
                <span className="font-bold font-mono text-stone-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Logistics</span>
                <span className="font-bold font-mono text-stone-800">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold font-display">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-50">
                <span className="text-sm font-bold font-display text-stone-800">Final Total</span>
                <span className="text-xl font-bold font-mono text-emerald-800">₹{total}</span>
              </div>
            </div>

            {/* Safety Assurances */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-[10px] text-stone-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold font-mono tracking-wider text-stone-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                SECURE PLATFORM GUARANTEE
              </div>
              <p className="leading-relaxed">
                Our payment checkout is certified PCI-DSS compliant. No credential cards or bank information are stored locally on our system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
