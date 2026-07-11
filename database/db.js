import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Environment URI check
const MONGODB_URI = process.env.MONGODB_URI || '';
let isConnectedToMongo = false;

// Initialize MongoDB connection if URI is available
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      isConnectedToMongo = true;
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err.message);
      console.log('Falling back to Local JSON Database storage.');
      isConnectedToMongo = false;
    });
} else {
  console.log('MONGODB_URI not provided. Running in Local JSON Database storage mode.');
}

// -------------------------------------------------------------
// MONGOOSE SCHEMAS (For MongoDB Mode)
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }, // admin or customer
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g. "kg", "pack"
  image: { type: String, required: true } // lucide icon name or image url
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  status: { type: String, default: 'Pending' }, // Pending, Paid, Processing, Shipped, Delivered
}, { timestamps: true });

// Declare mongoose models lazy initialization to prevent crashes if mongo is off
let MongoUser, MongoProduct, MongoOrder;
try {
  MongoUser = mongoose.model('User', UserSchema);
  MongoProduct = mongoose.model('Product', ProductSchema);
  MongoOrder = mongoose.model('Order', OrderSchema);
} catch (e) {
  // Models might be compiled already
}

// -------------------------------------------------------------
// LOCAL FILE DATABASE IMPLEMENTATION (For Local Mode Fallback)
// -------------------------------------------------------------
const getLocalFile = (filename) => path.join(DATA_DIR, filename);

const readLocalData = (filename, defaultData = []) => {
  const filePath = getLocalFile(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultData;
  }
};

const writeLocalData = (filename, data) => {
  const filePath = getLocalFile(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing to ${filename}:`, err);
    return false;
  }
};

// Initial Seed Products
const initialProducts = [
  {
    id: "p1",
    name: "Organic Farm Tomatoes",
    description: "Freshly plucked, rich in lycopene, organic red tomatoes from local farms.",
    price: 45,
    category: "Vegetables",
    stock: 120,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p2",
    name: "Alphonso Mangoes",
    description: "Sweet, juicy, and premium Alphonso mangoes, selected for high quality.",
    price: 280,
    category: "Fruits",
    stock: 50,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p3",
    name: "Premium Cardamom (Elachi)",
    description: "Highly aromatic local green cardamom pods, perfect for tea and cooking.",
    price: 180,
    category: "Spices",
    stock: 45,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p4",
    name: "Pure Farm Ghee",
    description: "Traditional grass-fed cow ghee, prepared with traditional hand-churned methods.",
    price: 680,
    category: "Dairy",
    stock: 30,
    unit: "liter",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p5",
    name: "Fresh Spinach (Palak)",
    description: "Iron-rich, clean, crispy, organic spinach leaves harvested daily.",
    price: 25,
    category: "Vegetables",
    stock: 80,
    unit: "bundle",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p6",
    name: "Cold-Pressed Coconut Oil",
    description: "Pure extraction of oil from sundried coconuts, nutrient-rich and chemical-free.",
    price: 220,
    category: "Grains & Oils",
    stock: 60,
    unit: "liter",
    image: "https://images.unsplash.com/photo-1624454001525-41489111306f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p7",
    name: "Red Onions",
    description: "High-quality farm-fresh local red onions, crispy and perfectly dried.",
    price: 35,
    category: "Vegetables",
    stock: 200,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p8",
    name: "Organic Turmeric Powder",
    description: "Freshly ground premium quality local turmeric with high curcumin content.",
    price: 85,
    category: "Spices",
    stock: 110,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p9",
    name: "Organic Strawberries",
    description: "Sweet, juicy red strawberries hand-picked from certified organic farms.",
    price: 160,
    category: "Fruits",
    stock: 40,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p10",
    name: "Green Granny Smith Apples",
    description: "Crisp, tart, and highly refreshing green apples, perfect for snacking or salads.",
    price: 190,
    category: "Fruits",
    stock: 65,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p11",
    name: "Cavendish Bananas",
    description: "Sweet, naturally ripened golden yellow bananas rich in vitamins and potassium.",
    price: 55,
    category: "Fruits",
    stock: 150,
    unit: "dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p12",
    name: "Seedless Red Grapes",
    description: "Plump, sweet, and incredibly juicy imported red grapes.",
    price: 140,
    category: "Fruits",
    stock: 45,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1537084642907-629340c7e5a4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p13",
    name: "Zesty Orange Citruses",
    description: "High juice-yield fresh oranges, packed with pure vitamin C.",
    price: 110,
    category: "Fruits",
    stock: 90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p14",
    name: "Fresh Blueberries",
    description: "Antioxidant-rich premium hand-plucked wild blueberries.",
    price: 260,
    category: "Fruits",
    stock: 35,
    unit: "pack",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p15",
    name: "Red Royal Gala Apples",
    description: "Deliciously sweet and crispy deep red apples imported from Himachal orchards.",
    price: 220,
    category: "Fruits",
    stock: 70,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p16",
    name: "Tropical Pineapple",
    description: "Ripe, sweet, and tangily refreshing golden pineapples.",
    price: 90,
    category: "Fruits",
    stock: 40,
    unit: "piece",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p17",
    name: "Ruby Red Pomegranates",
    description: "Fresh, nutrient-dense pomegranates with juicy ruby-red seeds.",
    price: 240,
    category: "Fruits",
    stock: 55,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=600&q=80"
  }
];

// Load local files if they don't exist
readLocalData('users.json', [
  // Admin default user (password is "admin123" encrypted or simple, we'll hash it on use or verify directly)
  {
    id: "u1",
    username: "Admin Seller",
    email: "admin@market.com",
    password: "$2a$10$UbyP8hF.bA69k.v7S/rB5eeT1P4G8H.7eY1f5j.eZis3w6P.N7mE.", // bcrypt hash of "admin123"
    role: "admin"
  }
]);
readLocalData('products.json', initialProducts);
readLocalData('orders.json', []);

// -------------------------------------------------------------
// DATABASE INTERFACE WRAPPER (Unified API)
// -------------------------------------------------------------
export const db = {
  // --- USERS OPERATIONS ---
  users: {
    find: async (query = {}) => {
      if (isConnectedToMongo) {
        return await MongoUser.find(query);
      } else {
        const users = readLocalData('users.json');
        return users.filter(u => {
          for (let key in query) {
            if (u[key] !== query[key]) return false;
          }
          return true;
        });
      }
    },
    findOne: async (query = {}) => {
      if (isConnectedToMongo) {
        return await MongoUser.findOne(query);
      } else {
        const users = readLocalData('users.json');
        const user = users.find(u => {
          for (let key in query) {
            if (u[key] !== query[key]) return false;
          }
          return true;
        });
        return user || null;
      }
    },
    create: async (userData) => {
      if (isConnectedToMongo) {
        const newUser = new MongoUser(userData);
        return await newUser.save();
      } else {
        const users = readLocalData('users.json');
        const newUser = {
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          ...userData,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        writeLocalData('users.json', users);
        return newUser;
      }
    }
  },

  // --- PRODUCTS OPERATIONS ---
  products: {
    find: async (query = {}) => {
      if (isConnectedToMongo) {
        return await MongoProduct.find(query);
      } else {
        const products = readLocalData('products.json');
        return products.filter(p => {
          for (let key in query) {
            if (p[key] !== query[key]) return false;
          }
          return true;
        });
      }
    },
    findById: async (id) => {
      if (isConnectedToMongo) {
        return await MongoProduct.findById(id);
      } else {
        const products = readLocalData('products.json');
        return products.find(p => p.id === id || p._id === id) || null;
      }
    },
    create: async (productData) => {
      if (isConnectedToMongo) {
        const newProduct = new MongoProduct(productData);
        return await newProduct.save();
      } else {
        const products = readLocalData('products.json');
        const newProduct = {
          id: 'p_' + Math.random().toString(36).substr(2, 9),
          ...productData,
          price: Number(productData.price),
          stock: Number(productData.stock),
          createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        writeLocalData('products.json', products);
        return newProduct;
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isConnectedToMongo) {
        return await MongoProduct.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        const products = readLocalData('products.json');
        const index = products.findIndex(p => p.id === id || p._id === id);
        if (index !== -1) {
          products[index] = {
            ...products[index],
            ...updateData,
            price: updateData.price !== undefined ? Number(updateData.price) : products[index].price,
            stock: updateData.stock !== undefined ? Number(updateData.stock) : products[index].stock,
            updatedAt: new Date().toISOString()
          };
          writeLocalData('products.json', products);
          return products[index];
        }
        return null;
      }
    },
    findByIdAndDelete: async (id) => {
      if (isConnectedToMongo) {
        return await MongoProduct.findByIdAndDelete(id);
      } else {
        const products = readLocalData('products.json');
        const filtered = products.filter(p => p.id !== id && p._id !== id);
        writeLocalData('products.json', filtered);
        return { deleted: true };
      }
    }
  },

  // --- ORDERS OPERATIONS ---
  orders: {
    find: async (query = {}) => {
      if (isConnectedToMongo) {
        return await MongoOrder.find(query).sort({ createdAt: -1 });
      } else {
        let orders = readLocalData('orders.json');
        const filtered = orders.filter(o => {
          for (let key in query) {
            if (o[key] !== query[key]) return false;
          }
          return true;
        });
        // Sort by date descending
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    },
    findOne: async (query = {}) => {
      if (isConnectedToMongo) {
        return await MongoOrder.findOne(query);
      } else {
        const orders = readLocalData('orders.json');
        return orders.find(o => {
          for (let key in query) {
            if (o[key] !== query[key]) return false;
          }
          return true;
        }) || null;
      }
    },
    create: async (orderData) => {
      if (isConnectedToMongo) {
        const newOrder = new MongoOrder(orderData);
        return await newOrder.save();
      } else {
        const orders = readLocalData('orders.json');
        const newOrder = {
          id: 'o_' + Math.random().toString(36).substr(2, 9),
          orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          ...orderData,
          status: 'Pending',
          paymentStatus: orderData.paymentStatus || 'Pending',
          createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        writeLocalData('orders.json', orders);
        return newOrder;
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isConnectedToMongo) {
        return await MongoOrder.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        const orders = readLocalData('orders.json');
        const index = orders.findIndex(o => o.id === id || o._id === id || o.orderNumber === id);
        if (index !== -1) {
          orders[index] = {
            ...orders[index],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          writeLocalData('orders.json', orders);
          return orders[index];
        }
        return null;
      }
    }
  }
};
