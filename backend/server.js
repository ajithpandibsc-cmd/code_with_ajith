import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from '../database/db.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'market_secret_key_987654321_local_dev';

app.use(express.json());

// -------------------------------------------------------------
// JWT AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication required. Please log in.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Session expired. Please log in again.' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
  });
};

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// --- Auth Endpoints ---

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default first user as admin, or explicit admin if registered
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const user = await db.users.create({
      username,
      email,
      password: hashedPassword,
      role: userRole
    });

    // Create Token
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Create Token
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Verify token session validity
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- Products Endpoints ---

// Get all products (Available to public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.products.find({});
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to retrieve products.' });
  }
});

// Add new product (Admin only)
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, unit, image } = req.body;
    if (!name || !description || price === undefined || !category || stock === undefined || !unit) {
      return res.status(400).json({ message: 'Required details missing.' });
    }

    const newProduct = await db.products.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      unit,
      image: image || 'carrot'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product.' });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, unit, image } = req.body;
    const updated = await db.products.findByIdAndUpdate(req.params.id, {
      name,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      category,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      unit,
      image
    });

    if (!updated) return res.status(444).json({ message: 'Product not found.' });
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const result = await db.products.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully', result });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

// --- Orders Endpoints ---

// Create new order (Authenticate users, or allow guest but we want login)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, paymentDetails } = req.body;
    
    if (!items || items.length === 0 || !totalAmount || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Order checkout details are incomplete.' });
    }

    // Double check inventory stock & decrease it
    for (const item of items) {
      const product = await db.products.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product "${item.name}" no longer exists in market.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${item.name}". Only ${product.stock} ${product.unit} left.` });
      }
    }

    // Deduct stock
    for (const item of items) {
      const product = await db.products.findById(item.productId);
      await db.products.findByIdAndUpdate(item.productId, {
        stock: product.stock - item.quantity
      });
    }

    // Formulate Order Number
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Mock Secure Payment check
    let paymentStatus = 'Pending';
    if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
      paymentStatus = 'Paid'; // Card & UPI immediately confirm payment in our checkout integration
    } else {
      paymentStatus = 'Pending'; // Cash on Delivery
    }

    const order = await db.orders.create({
      orderNumber: orderNum,
      userId: req.user.id,
      customerName: req.user.username,
      items,
      totalAmount: parseFloat(totalAmount),
      shippingAddress,
      paymentMethod,
      paymentStatus,
      status: paymentStatus === 'Paid' ? 'Paid' : 'Pending'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to process checkout.' });
  }
});

// Get user orders or admin all orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await db.orders.find({});
    } else {
      orders = await db.orders.find({ userId: req.user.id });
    }
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to load order list.' });
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updated = await db.orders.findByIdAndUpdate(req.params.id, {
      status,
      paymentStatus
    });

    if (!updated) return res.status(404).json({ message: 'Order not found.' });
    res.json(updated);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order.' });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node-Express backend running on http://localhost:${PORT}`);
  });
}

startServer();
