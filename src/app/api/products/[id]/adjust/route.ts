import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Product } from "@/entities/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, quantity } = await req.json();

    if (!["add", "remove"].includes(action) || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid action or quantity" }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Product);
    const product = await repo.findOne({ where: { id: parseInt(params.id) } });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (action === "add") {
      product.stock += parseInt(quantity);
    } else {
      product.stock = Math.max(0, product.stock - parseInt(quantity));
    }

    await repo.save(product);
    return NextResponse.json({ product, newStock: product.stock });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
