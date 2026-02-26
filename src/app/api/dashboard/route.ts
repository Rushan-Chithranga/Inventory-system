import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Product } from "@/entities/Product";
import { Sale } from "@/entities/Sale";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ds = await getDataSource();
    const productRepo = ds.getRepository(Product);
    const saleRepo = ds.getRepository(Sale);

    const products = await productRepo.find({ where: { isActive: true } });
    const sales = await saleRepo.find({ order: { saleDate: "DESC" } });

    const totalRevenue = sales.reduce((t, s) => t + Number(s.totalPrice), 0);
    const totalStock = products.reduce((t, p) => t + p.stock, 0);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const month = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const monthSales = sales.filter(s => {
        const sd = new Date(s.saleDate);
        return sd.getMonth() === d.getMonth() && sd.getFullYear() === year;
      });
      return {
        month,
        revenue: monthSales.reduce((t, s) => t + Number(s.totalPrice), 0),
        units: monthSales.reduce((t, s) => t + s.quantity, 0),
      };
    });

    const catMap: Record<string, number> = {};
    sales.forEach(s => {
      catMap[s.productCategory] = (catMap[s.productCategory] || 0) + Number(s.totalPrice);
    });
    const categoryRevenue = Object.entries(catMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      totalRevenue,
      totalProducts: products.length,
      totalStock,
      totalSales: sales.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      recentSales: sales.slice(0, 5),
      lowStockProducts: lowStockProducts.slice(0, 8),
      monthlySales,
      categoryRevenue,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
