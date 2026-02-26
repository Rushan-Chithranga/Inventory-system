import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Product } from "@/entities/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "Barcode required" }, { status: 400 });

    const ds = await getDataSource();
    const product = await ds.getRepository(Product).findOne({
      where: { barcode: code, isActive: true },
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
