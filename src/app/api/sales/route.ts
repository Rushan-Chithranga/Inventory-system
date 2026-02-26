import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Sale } from "@/entities/Sale";
import { Product } from "@/entities/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const limit = parseInt(searchParams.get("limit") || "100");

    const ds = await getDataSource();
    let query = ds.getRepository(Sale).createQueryBuilder("sale");

    if (search) {
      query = query.where("sale.productName LIKE :search", { search: `%${search}%` });
    }
    if (category) {
      query = query.andWhere("sale.productCategory = :category", { category });
    }
    if (dateFrom) {
      query = query.andWhere("sale.saleDate >= :dateFrom", { dateFrom });
    }
    if (dateTo) {
      query = query.andWhere("sale.saleDate <= :dateTo", { dateTo: dateTo + " 23:59:59" });
    }

    const sales = await query.orderBy("sale.saleDate", "DESC").limit(limit).getMany();
    const totalRevenue = sales.reduce((t, s) => t + Number(s.totalPrice), 0);
    const totalQty = sales.reduce((t, s) => t + s.quantity, 0);

    return NextResponse.json({ sales, totalRevenue, totalQty });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId, quantity, notes } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 });
    }

    const ds = await getDataSource();
    const productRepo = ds.getRepository(Product);
    const saleRepo = ds.getRepository(Sale);

    const product = await productRepo.findOne({ where: { id: productId, isActive: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stock < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    // Deduct stock
    product.stock -= quantity;
    await productRepo.save(product);

    const totalPrice = product.price * quantity;
    const sale = saleRepo.create({
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      quantity,
      unitPrice: product.price,
      totalPrice,
      notes,
    });

    await saleRepo.save(sale);
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
