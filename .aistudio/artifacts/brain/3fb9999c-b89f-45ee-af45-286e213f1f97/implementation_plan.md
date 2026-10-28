# FreshMart — Full-Stack Online Supermarket E-Commerce Platform

A production-grade, full-stack online supermarket e-commerce platform featuring a customer storefront, real-time inventory management, transactional Cash on Delivery checkout, and an administrative control panel with live analytics.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed and incorporated into the architectural blueprint:

- **Confirmed Decision 1 (Database Runtime & Portability)**: We will utilize **Prisma ORM with SQLite** inside the live AI Studio environment for high-performance, instant setup and real relational persistence, while generating a 1:1 compatible **PostgreSQL Prisma schema, migration scripts, and export tooling** for your local macOS Monterey machine.
- **Confirmed Decision 2 (Catalog Assortment)**: FreshMart will feature **farm-fresh organic produce and daily supermarket essentials** (fresh fruits, leafy greens, dairy & eggs, artisanal bakery, pantry staples, beverages, and household goods) with over 30 realistic seeded products.
- **Confirmed Decision 3 (Mentorship & Learning)**: Every milestone will conclude with a structured beginner-friendly breakdown: summary of changes, key file explanations, data flow mapping, verification instructions, bug post-mortems, and a guided practice task.

---

## 1. Overview & Core Concept

- **What It Does**: FreshMart provides a supermarket shopping experience: customers can explore seasonal collections, search with live multi-parameter filters (category, price range, stock status), manage cart items with server-side validation, place Cash on Delivery orders with atomic stock reservation, and track delivery progress via an interactive timeline. Store managers access an administrative dashboard to manage products, categories, stock adjustments, order fulfillment, and live sales metrics.
- **Target Audience / Persona**: Everyday grocery shoppers looking for farm-fresh produce and reliable essentials, alongside supermarket managers requiring accurate inventory and order tracking.
- **Key Value**: Reliable, accurate e-commerce without client-side total calculations or phantom stock, built with clear architectural patterns suitable for full-stack learners.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Storefront Discovery**: Shoppers land on a fresh, modern homepage with an editorial hero banner, department highlights, and featured seasonal produce.
2. **Product Catalog & Filtering**: Shoppers browse products in a 3-column responsive grid with synchronized search, category tabs, price slider, and stock filter.
3. **Contiguous Product Purchase**: On the Product Details page, a contiguous purchase module displays product imagery, unit pricing, real-time stock availability, and a quantity selector that caps selections at current stock.
4. **Shopping Cart & Synced Storage**: Items are saved in local storage for guests and automatically merged into the server database upon customer login.
5. **Secure Checkout**: Authenticated shoppers provide delivery details, delivery notes, and review an authoritative server-calculated order breakdown with free delivery threshold indicators.
6. **Order Confirmation & Tracking**: Post-purchase confirmation displays an order receipt and a 6-stage delivery status timeline (*Pending → Confirmed → Preparing → Out for Delivery → Delivered / Cancelled*).
7. **Admin Management Suite**: Store managers sign in to an administrative console with high-level KPI cards, low-stock warnings, product creation/editing modal, category management, inventory adjustment logs, and order status transitions.

### Visual Identity & Theme
- **Aesthetic Direction**: Clean, contemporary organic supermarket aesthetic with crisp spatial structure, subtle hairline borders, and zero-pill metadata discipline.
- **Color Palette**:
  - Dominant Neutral Canvas (60%): Crisp White (`#FFFFFF`) with soft neutral backgrounds (`#F8FAFC` slate-50).
  - Structural Surfaces (30%): Clean white cards (`#FFFFFF`), subtle slate borders (`#E2E8F0` slate-200), and dark slate typography (`#0F172A` slate-900).
  - High-Intent Accent Budget (10%): Fresh Emerald Green (`#16A34A` emerald-600 / `#15803D` emerald-700) for primary buy actions and brand accents, paired with warm harvest amber (`#D97706` amber-600) for seasonal tags and ratings.
- **Typography & Scale**:
  - Display & Brand: `Plus Jakarta Sans`, SemiBold/Bold for headlines and brand mark.
  - Body Prose: `Plus Jakarta Sans`, 15px–16px with 1.6 line-height.
  - Data, Prices & SKUs: Tabular numerals (`font-mono tabular-nums`).
- **Zero-Pill & Metadata Discipline**: Metadata (department, unit size, stock count, dates) rendered as clean unboxed text separated by subtle middots (`·`). Interactive filters styled as clean segmented buttons.
- **Top Bar Contract**: Strict 3-zone layout:
  `[FreshMart Wordmark] — [Shop Catalog · Categories · Deals · About] — [Search Input · Cart Bag (with live item count) · Account / Sign In]`

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Single-Process Full-Stack Server Architecture
- **Chosen Approach**: Configure Express.js in `server.ts` to mount Vite middleware in development mode and serve API routes under `/api/*` on port 3000.
- **Why**: Allows seamless client-server communication without cross-origin cookie blockers or separate process managers in the preview container, while strictly preserving clean frontend/backend separation.
- **Alternatives Considered**: Running separate ports for client (3000) and backend (5000); rejected due to container port constraints and CORS cookie security restrictions.

### Decision 2: Prisma ORM with Dual-Engine Compatibility
- **Chosen Approach**: Use Prisma ORM with SQLite for live container execution, paired with an exact 1:1 PostgreSQL schema definition and migration generator for local macOS Monterey deployment.
- **Why**: Delivers instant, zero-configuration database boot-up and relational persistence with zero external network latency, while fulfilling all PostgreSQL schema and transactional requirements.

### Decision 3: Authoritative Backend Pricing & Atomic Stock Transactions
- **Chosen Approach**: The client never passes subtotal, tax, or unit prices to order endpoints. Express recalculates prices strictly from database records inside a Prisma transaction, verifying stock availability and decrementing inventory atomically.
- **Why**: Prevents race conditions, price manipulation, and negative stock balances.

### Decision 4: Role-Based Access Control (RBAC) & Cookie Auth
- **Chosen Approach**: Passwords hashed with `bcryptjs`. Authentication tokens stored in HTTP-only, secure cookies. Role middleware (`requireAdmin`, `requireAuth`) protects administrative endpoints.
- **Why**: Shields user credentials against XSS token theft and ensures customers cannot self-promote to admin.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRESHMART WEB CLIENT                            │
│  React 19 · Vite · Tailwind CSS · React Router · Context API (Auth/Cart) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Requests (Fetch API / Cookies)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS APPLICATION SERVER                       │
│  - Security: Helmet, CORS, Rate Limiting, JSON Parser, Cookie Parser  │
│  - Middleware: Auth Token Verifier, Role Guard (Customer / Admin)      │
│  - Route Controllers:                                                  │
│    ├── /api/auth       (Register, Login, Logout, Current User)         │
│    ├── /api/categories (List, Create, Update, Delete with guards)      │
│    ├── /api/products   (List with filtering/pagination, CRUD)          │
│    ├── /api/cart       (Get, Add, Update qty, Remove, Sync guest cart) │
│    ├── /api/orders     (Create transaction, List my orders, Details)   │
│    └── /api/admin      (Dashboard KPIs, Stock Adjustments, Order status)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma Client
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PRISMA ORM & DATABASE                          │
│  - SQLite (Live Dev Sandbox) / PostgreSQL (Mac Monterey / Production)  │
│  - Entities: User, Category, Product, Cart, CartItem, Order,           │
│              OrderItem, InventoryMovement, StoreSetting                │
└────────────────────────────────────────────────────────────────────────┘
```

### Relational Data Models

1. **User**: `id`, `name`, `email` (unique), `passwordHash`, `role` (`CUSTOMER` | `ADMIN`), `phone`, `address`, `createdAt`, `updatedAt`
2. **Category**: `id`, `name`, `slug` (unique), `description`, `imageUrl`, `isActive`, `createdAt`
3. **Product**: `id`, `name`, `slug` (unique), `sku` (unique), `description`, `price` (Decimal), `promotionalPrice` (Decimal, nullable), `unit` (e.g., "per kg", "per pack", "per bunch"), `stockQuantity`, `lowStockThreshold`, `imageUrl`, `isActive`, `isFeatured`, `categoryId`, `createdAt`, `updatedAt`
4. **Cart & CartItem**: `Cart` (userId, updatedAt); `CartItem` (cartId, productId, quantity, unique on [cartId, productId])
5. **Order & OrderItem**: `Order` (orderNumber, userId, status, paymentMethod, paymentStatus, subtotal, deliveryFee, totalAmount, deliveryName, deliveryPhone, deliveryAddress, deliveryNotes, createdAt); `OrderItem` (orderId, productId, productNameSnapshot, unitPriceSnapshot, quantity, subtotal)
6. **InventoryMovement**: `id`, `productId`, `changeQuantity`, `reason`, `adminUserId`, `createdAt`
7. **StoreSetting**: `key`, `value`, `updatedAt` (store name, delivery fee, free delivery threshold, contact info)

---

## 5. Milestone Implementation Plan

- **Milestone 1**: Project inspection, package installation (Prisma, bcryptjs, jsonwebtoken, cookie-parser, zod, express-rate-limit, cors), and unified Express+Vite development server configuration.
- **Milestone 2**: Prisma schema creation, database generation, and deterministic seeding of 8 categories, 30+ authentic grocery products, initial store settings, and default admin/customer accounts.
- **Milestone 3**: Express API implementation: authentication routes, cookie management, validation schemas (Zod), product & category controllers, cart management, and order placement transactions.
- **Milestone 4**: React customer storefront: navigation top bar, hero section, department cards, product catalog with live search/filter/sort, product details view, and responsive cart slide-over.
- **Milestone 5**: Customer authentication flow, persistent cart synchronization, checkout form with delivery verification, order placement, and customer order history with status timeline.
- **Milestone 6**: Admin dashboard: KPI analytics, product inventory CRUD, category management, manual stock adjustment with movement audit logs, and order status fulfillment transitions.
- **Milestone 7**: Integration verification, empty/loading states, error handling, and build validation (`npm run build`).
- **Milestone 8**: Beginner-friendly `README.md` containing macOS Monterey PostgreSQL setup, Prisma commands, API reference, architecture explanation, and practice tasks.
