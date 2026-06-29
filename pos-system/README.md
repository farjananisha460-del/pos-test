# Point of Sale (POS) System

A production-ready Point of Sale (POS) application built with **Laravel 11**, **React 18**, **Inertia.js**, **Vite**, and **Tailwind CSS**.

---

## Technical Features Implemented

### 1. Database Schema
- **Users**: Supports roles (`admin`, `cashier`) to differentiate system privileges.
- **Categories & Products**: Maintains barcode/SKU mappings, pricing structures (cost and retail), and stock quantities.
- **Orders**: Tracks invoices, pricing aggregations (subtotal, tax, discount, grand total), payment parameters, and cashier links.
- **Order Items**: Captures product associations, sold quantities, and historical unit prices to maintain accurate reporting even when product retail prices change in the future.

### 2. Core Backend Transaction Logic
- Uses `DB::transaction()` blocks inside the `OrderController@store` method to ensure sales logs are written and inventory stock is decremented in a single atomic database operation.
- Employs row-level database locking (`Product::lockForUpdate()->findOrFail(...)`) to prevent double-selling or stock discrepancies during concurrent checkouts.
- Aborts checkouts and rolls back database updates if any item has insufficient stock.

### 3. Frontend Checkout Grid UI
- **Split-Screen Layout**: Left side displays a category filter list and a searchable grid of products with low-stock badges and sold-out blockers. Right side is the active cart with line-item totals and tax/discount calculations.
- **Barcode Scanner Hook**: Integrates a global listener `useBarcodeScanner.js` that detects rapid keystrokes from optical scanners (or typed entries with <40ms intervals) and auto-injects products into the cart.
- **Suspend/Hold Cart**: Uses browser local storage to let cashiers hold multiple active shopping baskets and restore or discard them later.
- **Checkout Modal**: Provides support for Cash and Card checkouts, includes a touch-friendly virtual numpad for cashiers, checks for short-tenders, calculates change due, and boots print formatting.
- **80mm Thermal Receipt Layout**: Styles and renders print jobs styled for standard 80mm thermal receipt printers using `@media print` CSS overrides.

---

## Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
- **PHP 8.2+**
- **Composer**
- **Node.js 18+ & NPM**

### 2. Project Installation
Run the following commands inside this directory to get started:

```bash
# 1. Install Composer dependencies
composer install

# 2. Install Node dependencies
npm install

# 3. Create database file
mkdir database
touch database/database.sqlite

# 4. Generate app encryption key
php artisan key:generate

# 5. Run migrations and seed default products/cashiers
php artisan migrate --seed
```

### 3. Start Development Servers
Open two terminal windows and execute the following:

**Terminal 1 (Backend API):**
```bash
php artisan serve
```

**Terminal 2 (Frontend Assets Compiler):**
```bash
npm run dev
```

Visit the application in your browser at `http://localhost:8000`.

---

## Demo Credentials & Testing

### 1. Shift Auth Credentials
- **Cashier Account**: `cashier@pos.local` (Password: `password`)
- **Admin Account**: `admin@pos.local` (Password: `password`)

*Note: The login page includes quick-fill buttons to easily toggle between accounts during testing.*

### 2. Barcode Scanner Testing
To test the automatic barcode scanning addition without a hardware scanner:
1. Click the search bar or anywhere on the page to focus the screen.
2. Rapidly type a seeded barcode string (e.g. `8801111999` for Coca-Cola) followed by `Enter` (within 100ms).
3. The system will detect the barcode sequence and automatically increment Coca-Cola in your cart with a toast notification.
4. Attempting to scan or add more items than the current stock limits will trigger a warning.
