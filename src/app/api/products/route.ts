import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Product } from "@/entities/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const ds = await getDataSource();
    const repo = ds.getRepository(Product);

    let query = repo.createQueryBuilder("product").where("product.isActive = :active", { active: true });

    if (search) {
      query = query.andWhere(
        "(product.name LIKE :search OR product.barcode LIKE :search OR product.description LIKE :search)",
        { search: `%${search}%` }
      );
    }
    if (category) {
      query = query.andWhere("product.category = :category", { category });
    }
    if (status === "low") {
      query = query.andWhere("product.stock <= product.lowStockThreshold AND product.stock > 0");
    } else if (status === "out") {
      query = query.andWhere("product.stock = 0");
    } else if (status === "ok") {
      query = query.andWhere("product.stock > product.lowStockThreshold");
    }

    const products = await query.orderBy("product.createdAt", "DESC").getMany();
    return NextResponse.json({ products });
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
    const { name, description, category, price, stock, barcode, lowStockThreshold } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Product);

    const product = repo.create({
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      barcode,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      isActive: true,
    });

    await repo.save(product);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
