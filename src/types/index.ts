export interface ProductType {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  barcode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleType {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
  saleDate: string;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Store Manager";
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface ReportType {
  id: number;
  type: "Stock Level" | "Sales Summary" | "Purchase Report";
  summary: string;
  data: Record<string, unknown>;
  status: "Good" | "Warning" | "High";
  generatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalStock: number;
  totalSales: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentSales: SaleType[];
  lowStockProducts: ProductType[];
  monthlySales: { month: string; revenue: number; units: number }[];
  categoryRevenue: { category: string; revenue: number }[];
}

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  name: string;
}
