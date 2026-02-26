# 📦 StockWise — Inventory Management System

A full-stack inventory management system built with **Next.js 14**, **TypeORM**, **MySQL**, and **Tailwind CSS**.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **ORM**: TypeORM
- **Database**: MySQL
- **Auth**: JWT (stored in HTTP-only cookies)

## 📋 Features

- ✅ **Dashboard** — KPI cards, revenue charts, low stock alerts
- ✅ **Product Management** — Full CRUD (add, edit, soft-delete)
- ✅ **Stock Management** — Real-time monitoring, stock adjustments with alerts
- ✅ **Barcode Scanner** — Manual entry + simulated scan, scan history
- ✅ **Sales Reports** — Filterable sales transactions (date, category, search)
- ✅ **Stock Reports** — Visual stock level monitoring per product
- ✅ **Reports** — Auto-generated snapshot reports (Stock Level, Sales Summary, Purchase)
- ✅ **User Management** — Admin & Store Manager roles with permission matrix
- ✅ **Authentication** — JWT login with role-based access control

## 🧬 Clone Repository

### 1️⃣ Clone the Project

Using HTTPS:

```bash
git clone https://github.com/your-username/stockwise.git
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MySQL 8.0+

### 2. Create MySQL Database

```sql
CREATE DATABASE stockwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_DATABASE=stockwise_db
JWT_SECRET=your-secret-key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app runs on `http://localhost:3000`.
TypeORM with `synchronize: true` will auto-create all tables on first run.

### 6. Seed Demo Data (optional)

```bash
npm run seed
```

This creates:

- **Admin**: `admin@stockwise.com` / `admin123`
- **Manager**: `manager@stockwise.com` / `manager123`
- 8 sample products and 8 sales records

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── auth/           # Login, logout, me
│   │   ├── products/       # CRUD + barcode lookup + stock adjust
│   │   ├── sales/          # Sales records
│   │   ├── reports/        # Report generation
│   │   ├── users/          # User management
│   │   └── dashboard/      # Aggregated stats
│   ├── dashboard/          # Dashboard UI
│   ├── products/           # Product management UI
│   ├── sales/              # Sales report UI
│   ├── stock/              # Stock report UI
│   ├── reports/            # All reports UI
│   ├── users/              # User management UI
│   ├── barcode/            # Barcode scanner UI
│   └── login/              # Login page
├── components/
│   ├── layout/             # Sidebar, AppShell (topbar)
│   └── ui/                 # Reusable: Button, Card, Modal, Badge, etc.
├── entities/               # TypeORM entities
│   ├── Product.ts
│   ├── Sale.ts
│   ├── User.ts
│   └── Report.ts
├── lib/
│   ├── data-source.ts      # TypeORM DataSource config
│   ├── auth.ts             # JWT helpers
│   ├── auth-context.tsx    # React AuthContext
│   └── seed.ts             # Database seed script
└── types/
    └── index.ts            # TypeScript interfaces
```

## 🗄️ Database Schema

### Products Table

| Column              | Type          | Description          |
| ------------------- | ------------- | -------------------- |
| id                  | INT PK        | Auto increment       |
| name                | VARCHAR(255)  | Product name         |
| description         | TEXT          | Optional description |
| category            | VARCHAR(100)  | Product category     |
| price               | DECIMAL(10,2) | Unit price           |
| stock               | INT           | Current quantity     |
| low_stock_threshold | INT           | Alert threshold      |
| barcode             | VARCHAR(100)  | Barcode string       |
| is_active           | BOOLEAN       | Soft delete flag     |

### Sales Table

| Column       | Type          | Description           |
| ------------ | ------------- | --------------------- |
| id           | INT PK        | Auto increment        |
| product_id   | INT FK        | Reference to product  |
| product_name | VARCHAR(255)  | Denormalized name     |
| quantity     | INT           | Units sold            |
| unit_price   | DECIMAL(10,2) | Price at time of sale |
| total_price  | DECIMAL(10,2) | quantity × price      |
| sale_date    | DATETIME      | Transaction timestamp |

### Users Table

| Column    | Type                | Description           |
| --------- | ------------------- | --------------------- |
| id        | INT PK              | Auto increment        |
| name      | VARCHAR(255)        | Full name             |
| email     | VARCHAR(255) UNIQUE | Login email           |
| password  | VARCHAR(255)        | Bcrypt hash           |
| role      | ENUM                | Admin / Store Manager |
| is_active | BOOLEAN             | Account status        |

### Reports Table

| Column       | Type     | Description           |
| ------------ | -------- | --------------------- |
| id           | INT PK   | Auto increment        |
| type         | ENUM     | Report type           |
| summary      | TEXT     | Generated summary     |
| data         | JSON     | Raw report data       |
| status       | ENUM     | Good / Warning / High |
| generated_at | DATETIME | Creation time         |

## 🔐 API Endpoints

| Method | Endpoint                      | Auth  | Description     |
| ------ | ----------------------------- | ----- | --------------- |
| POST   | `/api/auth/login`             | ❌    | Login           |
| POST   | `/api/auth/logout`            | ✅    | Logout          |
| GET    | `/api/dashboard`              | ✅    | Stats & charts  |
| GET    | `/api/products`               | ✅    | List products   |
| POST   | `/api/products`               | ✅    | Create product  |
| PUT    | `/api/products/:id`           | ✅    | Update product  |
| DELETE | `/api/products/:id`           | Admin | Soft delete     |
| POST   | `/api/products/:id/adjust`    | ✅    | Adjust stock    |
| GET    | `/api/products/barcode?code=` | ✅    | Barcode lookup  |
| GET    | `/api/sales`                  | ✅    | List sales      |
| POST   | `/api/sales`                  | ✅    | Record sale     |
| GET    | `/api/reports`                | ✅    | List reports    |
| POST   | `/api/reports`                | ✅    | Generate report |
| GET    | `/api/users`                  | Admin | List users      |
| POST   | `/api/users`                  | Admin | Create user     |

## 🎨 UI Theme

Orange (`#f97316`) and Black (`#0a0a0a`) with Space Grotesk and Bebas Neue fonts.
