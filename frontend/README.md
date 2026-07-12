# 🛍️ SPA Market (Farm to Doorstep)

A highly polished, full-stack e-commerce and inventory management application. **SPA Market** bridges the gap between local farms and customers' doorsteps, providing a seamless marketplace to browse fresh produce, order online, track deliveries, and manage vendor catalogs.

The application features an elegant **React SPA** (with Vite & Tailwind CSS) on the frontend, and a robust **Node.js/Express server** with file-based database fallbacks on the backend, optimized to run locally, on Cloud Run, or on serverless hosting platforms like Vercel.

---

## ✨ Features

- 🥦 **Fresh Product Catalog**: Seamless browsing with filters, instant search, and real-time stock-level indicators.
- 🛒 **Interactive Basket & Checkout**: Smart cart calculations, quantity adjustment, and full checkout processing with delivery scheduling.
- 📦 **Live Order Tracking**: Interactive step-by-step delivery tracking showing status from packaging to doorstep delivery.
- 🔐 **User & Vendor Authentication**: Dedicated user sessions with customizable profile management.
- 📊 **Vendor Dashboard (Admin)**:
  - **Comprehensive Inventory Control**: Full CRUD operation for managing product specs (name, description, category, pricing, unit, image, and stock levels).
  - **Orders Console**: Accept, process, ship, or complete customer orders dynamically.
  - **Metrics & Analytics**: Interactive revenue, sale tracking, top products, and quick-insights widgets.

---

## 📁 Project Architecture & File Structure

This project uses a clean, unified full-stack architecture where the Express backend handles API requests and hosts the compiled React client.

```text
├── api/                    # Serverless entry point for Vercel
│   └── index.js            # Vercel function routing to Express server
├── backend/                # Express.js Server
│   └── server.js           # Main Express server, API endpoints, and static-serving setup
├── database/               # Local Database & Persistence layer
│   └── db.js               # Database models and fallback file storage managers
├── data/                   # Persistent local JSON data files
│   ├── products.json       # Product database
│   ├── users.json          # User profiles
│   └── orders.json         # Order tracking database
├── frontend/               # React + Vite Single Page Application (SPA)
│   ├── src/
│   │   ├── components/     # Reusable modular visual components
│   │   │   ├── Cart.jsx            # My Basket slide-out/overview
│   │   │   ├── Checkout.jsx        # Order completion form and schedule setup
│   │   │   ├── Dashboard.jsx       # Vendor inventory/order controller
│   │   │   ├── Login.jsx           # Clean user authentications
│   │   │   ├── OrderTracking.jsx   # Live order progress tracker
│   │   │   └── ProductCatalog.jsx  # Interactive product grid and category filters
│   │   ├── App.jsx         # Core app container, page routers, and global states
│   │   ├── main.jsx        # Frontend React entry point
│   │   └── index.css       # Tailwind stylesheet and typography imports
│   ├── index.html          # Frontend HTML template
│   └── vite.config.js      # Frontend build and dev server config
├── package.json            # Main workspace configurations, run scripts, & dependencies
├── vercel.json             # Vercel deployment, rewrites, and serverless routing rules
├── vite.config.js          # Root Vite integration configuration
└── tsconfig.json           # Global TypeScript rules
```

---

## 🚀 How to Run the App Locally

Follow these instructions to get the application up and running on your local machine in under 2 minutes:

### 1. Prerequisite: Root Directory Verification
Make sure your terminal is opened in the **outermost root folder** of the project (containing `backend`, `frontend`, `package.json`, etc.). 

If your terminal is inside a subdirectory like `frontend`, navigate back to the root:
```bash
cd ..
```

### 2. Install Dependencies
Install both backend and frontend dependencies in a single step from the root directory:
```bash
npm install
```

### 3. Start Development Server
Launch the full-stack server locally:
```bash
npm run dev
```

This will automatically spin up:
1. The **Express Backend APIs** on port `3000`.
2. The **Vite Dev Server** mounted directly onto the Express server as middleware.

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## ☁️ Deploying to Vercel

This project is fully optimized for continuous delivery and zero-config deployment on **Vercel**:

- **Vercel Serverless Function**: Routing is handled under `/api` by `api/index.js`, which exports our unified Express engine.
- **Persistent Temp Storage**: During serverless execution, local file modifications are directed into the `/tmp` scratch directory to bypass Vercel's read-only filesystem limitations.
- **Rewrites & SPA Fallbacks**: Customized `vercel.json` automatically directs standard routes to the static `index.html` and handles api proxies securely.

### Quick Deployment Steps:
1. Push this project to a **GitHub repository**.
2. Connect your repository to **Vercel** through the Vercel Dashboard.
3. Keep the default settings and hit **Deploy**. Vercel will build and host your applet seamlessly!
