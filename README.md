# FreshMart — Full-Stack Online Supermarket E-Commerce Platform

FreshMart is a full-stack online supermarket web application built with clean architecture, robust security safeguards, and a modern customer and administrative experience.

---

## 1. Project Overview & Features

FreshMart provides a comprehensive grocery shopping and management experience:

- **Customer Storefront**:
  - Interactive homepage with hero banner, 8 supermarket departments, and featured organic harvests.
  - Multi-parameter product catalog with keyword search, category tabs, price range filtering, in-stock filtering, and sorting.
  - Contiguous Product Detail Page (PDP) with stock availability indicators and quantity steppers capped at live stock.
  - Shopping Basket supporting guest browsing in `localStorage` and automatic account synchronization upon sign-in.
  - Transactional Checkout supporting **Cash on Delivery (COD)** and Simulated Instant Payment, with authoritative server-calculated pricing and atomic stock decrements.
  - Customer Order History with 6-stage delivery timeline (*Pending → Confirmed → Preparing → Out for Delivery → Delivered*).
- **Administrative Control Console**:
  - Live operations dashboard displaying real-time database KPIs (Total Products, Departments, Customers, Orders, Revenue, and Low-Stock Warnings).
  - Product Catalog CRUD with SKU uniqueness checks and historical order deactivation rules.
  - Department / Category Management with dependency guards.
  - Inventory & Stock Audit Suite with manual stock adjustment logs and movement audit trails.
  - Order Fulfillment Pipeline with valid status transition guards and automatic inventory restoration on order cancellation.
  - Registered Customer Directory with order frequency and lifetime spend metrics.
  - Store Settings configuration (delivery fee, free shipping threshold, store hours).

---

## 2. Technology Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Context API (`AuthContext`, `CartContext`), Native Fetch API |
| **Backend** | Node.js, Express.js, TypeScript / ES Modules, REST API Architecture |
| **Database & ORM** | Prisma ORM, SQLite (`prisma/dev.db` for container live preview) & PostgreSQL (`prisma/schema.postgres.prisma` for macOS / production) |
| **Security & Validation** | Zod (Request Validation), bcryptjs (Password Hashing), jsonwebtoken (JWT in secure HTTP-only cookies), Helmet, CORS |

### System Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   AuthContext (Session) · CartContext (Basket sync)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (fetch with cookies / bearer)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Express 4.21 Application Server          │
│   Helmet · CookieParser · CORS · Auth Middleware       │
│   Controllers: Auth, Category, Product, Cart, Order,   │
│                Admin Dashboard, Inventory              │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client ORM
                            ▼
┌────────────────────────────────────────────────────────┐
│            Relational Database Engine                  │
│   SQLite (Live Preview) / PostgreSQL 14 (Mac Monterey) │
│   Atomic Transactions · Foreign Keys · Unique SKUs     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
FreshMart/
├── prisma/
│   ├── schema.prisma          # SQLite schema (live container preview)
│   ├── schema.postgres.prisma # PostgreSQL schema (macOS Monterey / production)
│   ├── dev.db                 # SQLite local relational database
│   └── seed.ts                # Deterministic seed script (32 products, 8 categories, users)
├── server/
│   └── src/
│       ├── config.ts          # Central environment configuration & secrets
│       ├── db.ts              # Prisma Client singleton
│       ├── middleware/
│       │   └── auth.ts        # JWT extraction, requireAuth & requireAdmin guards
│       ├── validators/
│       │   └── schemas.ts     # Zod validation schemas
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── categoryController.ts
│       │   ├── productController.ts
│       │   ├── cartController.ts
│       │   ├── orderController.ts
│       │   └── adminController.ts
│       └── routes/
│           └── api.ts         # Master REST API router (/api/*)
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Navbar.tsx     # 3-Zone Top Bar with search, cart badge & demo switches
│   │       ├── Footer.tsx     # Grocery trust markers & store policies
│   │       ├── ProductCard.tsx# Lead image card with unboxed metadata
│   │       ├── CartDrawer.tsx # Slide-out basket with free shipping progress
│   │       ├── AuthModal.tsx  # Sign In / Register dialog with 1-click demo logins
│   │       └── Toast.tsx      # Real-time feedback toast
│   ├── context/
│   │   ├── AuthContext.tsx    # User session, login, register, logout, demo switches
│   │   └── CartContext.tsx    # Basket items, guest/server sync, total calculations
│   ├── pages/
│   │   ├── HomePage.tsx       # Campaign hero & department shelf
│   │   ├── CatalogPage.tsx    # Multi-parameter product filters & pagination
│   │   ├── ProductDetailPage.tsx # Contiguous purchase module & related items
│   │   ├── CheckoutPage.tsx   # Delivery form & COD order placement
│   │   ├── OrderHistoryPage.tsx # Past orders & 6-stage delivery timeline
│   │   ├── DealsPage.tsx      # Discounted supermarket specials
│   │   ├── AboutPage.tsx      # Cold chain logistics & sourcing philosophy
│   │   └── admin/
│   │       ├── AdminLayout.tsx    # Responsive admin sidebar & top bar
│   │       ├── AdminDashboard.tsx # Live KPI analytics & low stock warnings
│   │       ├── AdminProducts.tsx  # Product catalog management & modal CRUD
│   │       ├── AdminCategories.tsx# Department management
│   │       ├── AdminInventory.tsx # Stock audit & adjustment logs
│   │       ├── AdminOrders.tsx    # Order fulfillment & status transitions
│   │       ├── AdminCustomers.tsx # Customer directory & lifetime spend
│   │       └── AdminSettings.tsx  # Store parameters & delivery fees
│   ├── services/
│   │   └── api.ts             # Native Fetch client with credentials
│   ├── types/
│   │   └── index.ts           # Domain models and TypeScript contracts
│   ├── App.tsx                # Master app routing
│   ├── main.tsx               # DOM entry point
│   └── index.css              # Tailwind CSS layer with Plus Jakarta Sans
├── server.ts                  # Unified Express + Vite dev server (Port 3000)
├── package.json
└── README.md
```

---

## 4. Local macOS Monterey 12.7.6 Setup Instructions

### Prerequisites
- macOS Monterey (12.7.6)
- Node.js (v18.x or v20.x recommended)
- npm (v9.x or v10.x)
- Homebrew (for PostgreSQL)

### Step 1: Install & Start PostgreSQL via Homebrew
Open Terminal on your Mac:
```bash
# 1. Install PostgreSQL 14 (LTS compatible with Monterey)
brew install postgresql@14

# 2. Start PostgreSQL service
brew services start postgresql@14

# 3. Create the database
createdb freshmart
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freshmart?schema=public"
JWT_SECRET="freshmart-local-super-secret-jwt-key"
PORT=3000
```

### Step 3: Run Database Migrations & Seed
To use PostgreSQL on your Mac:
```bash
# Generate Prisma Client for PostgreSQL schema
npx prisma generate --schema=prisma/schema.postgres.prisma

# Push schema tables into your local PostgreSQL database
npx prisma db push --schema=prisma/schema.postgres.prisma

# Seed the database with 8 categories, 32 products, and demo accounts
npx tsx prisma/seed.ts
```

### Step 4: Start the Full-Stack Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Demo Accounts

For instant exploration without typing passwords, use the **1-Click Demo Login** buttons in the Sign In modal or header dropdown:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@freshmart.local` | `AdminFresh2026!` | Full Admin Console, KPI Dashboard, Inventory adjustments, Order status controls, Product CRUD |
| **Demo Customer** | `customer@freshmart.local` | `CustomerPass123!` | Storefront browsing, persistent basket sync, Cash on Delivery checkout, Order History & Timeline |

---

## 6. REST API Reference

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new customer account (sets HTTP-only cookie) |
| `/api/auth/login` | `POST` | Public | Sign in with email and password |
| `/api/auth/logout` | `POST` | Public | Sign out and clear session cookie |
| `/api/auth/me` | `GET` | Customer/Admin | Fetch current user session profile |
| `/api/products` | `GET` | Public | Query products with search, category, price, and pagination |
| `/api/products/:id` | `GET` | Public | Fetch product by ID |
| `/api/products/slug/:slug` | `GET` | Public | Fetch product by slug with related category items |
| `/api/products` | `POST` | Admin | Create new product (with SKU uniqueness check) |
| `/api/products/:id` | `PATCH` | Admin | Update product details or stock |
| `/api/products/:id` | `DELETE`| Admin | Delete product (or deactivate if order history exists) |
| `/api/categories` | `GET` | Public | List supermarket categories |
| `/api/categories` | `POST` | Admin | Create category |
| `/api/categories/:id`| `DELETE`| Admin | Delete category (with linked product protection) |
| `/api/cart` | `GET` | Customer | Fetch authoritative server cart |
| `/api/cart/items` | `POST` | Customer | Add product to cart (stock-capped) |
| `/api/cart/items/:id` | `PATCH`| Customer | Update item quantity |
| `/api/cart/items/:id` | `DELETE`| Customer | Remove item from cart |
| `/api/cart/sync` | `POST` | Customer | Merge guest `localStorage` items into DB cart |
| `/api/orders` | `POST` | Customer | Place order in transaction with atomic stock decrement |
| `/api/orders/my` | `GET` | Customer | List customer order history |
| `/api/orders/:id` | `GET` | Customer/Admin | View order receipt and delivery info |
| `/api/admin/dashboard` | `GET` | Admin | Fetch live KPI metrics, recent orders, and alerts |
| `/api/admin/orders` | `GET` | Admin | List all orders with status/search filtering |
| `/api/admin/orders/:id/status` | `PATCH` | Admin | Advance order status or cancel with stock restoration |
| `/api/admin/inventory` | `GET` | Admin | Audit inventory levels and recent movements |
| `/api/admin/inventory/adjustments` | `POST` | Admin | Record manual stock change with mandatory audit reason |
| `/api/admin/customers` | `GET` | Admin | View customer directory and lifetime spend |
| `/api/admin/settings` | `GET/PATCH` | Admin | View and update store settings |

---

## 7. Beginner Learning Walkthroughs & Practice Tasks

### Milestone 1 & 2: Database Modeling & Schema Parity
- **How data flows**: Prisma acts as the typed interface between Express TypeScript code and the database engine. In this dev container, Prisma connects to `file:./prisma/dev.db` (SQLite) for immediate zero-config operation. On your Mac, Prisma connects to PostgreSQL via `DATABASE_URL` using `prisma/schema.postgres.prisma`.
- **Practice Task 1**: Open `prisma/seed.ts`, add a 33rd product (for example, "Fresh Organic Avocados", `FRU-AVO-005`), and re-run `npx tsx prisma/seed.ts`. Check how it appears in the live catalog!

### Milestone 3 & 4: API Routes & Authoritative Pricing
- **Key Insight**: Never trust prices sent by the browser. The browser can be inspected and modified using DevTools. In `server/src/controllers/orderController.ts`, Express ignores any submitted prices and loads the fresh, trusted price directly from the database before summing the subtotal and delivery fee.
- **Practice Task 2**: Inspect `server/src/controllers/orderController.ts`. Notice how `FREE_DELIVERY_THRESHOLD` is queried from the `StoreSetting` table. If the subtotal is over $45, the delivery fee becomes $0.00. Try ordering $50 of groceries to see the fee waived!

### Milestone 5 & 6: Transactions & Atomic Stock Decrement
- **Key Insight**: What happens if two customers buy the last loaf of sourdough at the exact same second? A simple `update` can lead to overselling. `prisma.$transaction` guarantees that both the stock decrement and order creation succeed together, or roll back completely if stock runs out.
- **Practice Task 3**: Log in as `admin@freshmart.local`, navigate to **Inventory & Audit**, select any product, and submit a stock adjustment with a reason. Watch how the stock immediately reflects across both the customer catalog and the admin alert list!
