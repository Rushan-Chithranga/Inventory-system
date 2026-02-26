import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Product } from "@/entities/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ds = await getDataSource();
    const product = await ds.getRepository(Product).findOne({ where: { id: parseInt(params.id) } });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ds = await getDataSource();
    const repo = ds.getRepository(Product);

    const product = await repo.findOne({ where: { id: parseInt(params.id) } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const { name, description, category, price, stock, barcode, lowStockThreshold } = body;
    Object.assign(product, {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(barcode !== undefined && { barcode }),
      ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
    });

    await repo.save(product);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ds = await getDataSource();
    const repo = ds.getRepository(Product);

    const product = await repo.findOne({ where: { id: parseInt(params.id) } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Soft delete
    product.isActive = false;
    await repo.save(product);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
