import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { User } from "@/entities/User";
import { getUserFromRequest, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ds = await getDataSource();
    const users = await ds.getRepository(User).find({ order: { createdAt: "DESC" } });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(User);

    const existing = await repo.findOne({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const hashed = await hashPassword(password);
    const newUser = repo.create({ name, email, password: hashed, role: role || "Store Manager" });
    await repo.save(newUser);

    const { password: _, ...safeUser } = newUser as User & { password: string };
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
