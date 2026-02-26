import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Report } from "@/entities/Report";
import { Product } from "@/entities/Product";
import { Sale } from "@/entities/Sale";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ds = await getDataSource();
    const reports = await ds.getRepository(Report).find({ order: { generatedAt: "DESC" } });
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type } = await req.json();
    if (!["Stock Level", "Sales Summary", "Purchase Report"].includes(type)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    const ds = await getDataSource();
    const products = await ds.getRepository(Product).find({ where: { isActive: true } });
    const sales = await ds.getRepository(Sale).find();

    const totalRevenue = sales.reduce((t, s) => t + Number(s.totalPrice), 0);
    const lowStock = products.filter(p => p.stock <= p.lowStockThreshold).length;
    const inventoryValue = products.reduce((t, p) => t + p.stock * Number(p.price), 0);

    let summary = "";
    let status: "Good" | "Warning" | "High" = "Good";
    let data: Record<string, unknown> = {};

    if (type === "Stock Level") {
      status = lowStock > 0 ? "Warning" : "Good";
      summary = `${products.length} products tracked. ${lowStock} items below threshold. Inventory value: $${inventoryValue.toFixed(2)}.`;
      data = { totalProducts: products.length, lowStockCount: lowStock, inventoryValue };
    } else if (type === "Sales Summary") {
      status = "High";
      summary = `${sales.length} transactions recorded. Total revenue: $${totalRevenue.toFixed(2)}. Avg order: $${sales.length ? (totalRevenue / sales.length).toFixed(2) : "0.00"}.`;
      data = { totalSales: sales.length, totalRevenue, avgOrder: sales.length ? totalRevenue / sales.length : 0 };
    } else {
      status = "Good";
      summary = `Inventory audit complete. ${products.length} SKUs active. ${lowStock} reorders recommended. Total value: $${inventoryValue.toFixed(2)}.`;
      data = { totalProducts: products.length, reordersNeeded: lowStock, inventoryValue };
    }

    const reportRepo = ds.getRepository(Report);
    const report = reportRepo.create({ type, summary, data, status, generatedBy: user.userId });
    await reportRepo.save(report);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
