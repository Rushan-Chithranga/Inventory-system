import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Product } from "../entities/Product";
import { Sale } from "../entities/Sale";
import { User } from "../entities/User";
import { hashPassword } from "./auth";

async function seed() {
  await AppDataSource.initialize();
  console.log("📦 Connected to database. Seeding...");

  // Users
  const userRepo = AppDataSource.getRepository(User);
  const adminPass = await hashPassword("admin123");
  const managerPass = await hashPassword("manager123");

  const admin = userRepo.create({
    name: "Alex Rivera",
    email: "admin@stockwise.com",
    password: adminPass,
    role: "Admin",
    isActive: true,
  });
  const manager = userRepo.create({
    name: "Sam Chen",
    email: "manager@stockwise.com",
    password: managerPass,
    role: "Store Manager",
    isActive: true,
  });

  await userRepo.save([admin, manager]);
  console.log("✅ Users seeded");

  // Products
  const productRepo = AppDataSource.getRepository(Product);
  const products = productRepo.create([
    { name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones", category: "Electronics", price: 149.99, stock: 45, barcode: "8901234567890", lowStockThreshold: 10 },
    { name: "USB-C Hub", description: "7-in-1 USB-C multiport adapter", category: "Electronics", price: 49.99, stock: 8, barcode: "8901234567891", lowStockThreshold: 10 },
    { name: "Ergonomic Chair", description: "Lumbar support office chair", category: "Furniture", price: 299.99, stock: 3, barcode: "8901234567892", lowStockThreshold: 5 },
    { name: "Mechanical Keyboard", description: "TKL RGB mechanical keyboard", category: "Electronics", price: 89.99, stock: 22, barcode: "8901234567893", lowStockThreshold: 10 },
    { name: "Standing Desk", description: "Electric height-adjustable desk", category: "Furniture", price: 549.99, stock: 2, barcode: "8901234567894", lowStockThreshold: 5 },
    { name: "Webcam 4K", description: "Ultra HD streaming webcam", category: "Electronics", price: 119.99, stock: 15, barcode: "8901234567895", lowStockThreshold: 10 },
    { name: "Notebook A5", description: "Premium ruled notebook 200 pages", category: "Stationery", price: 12.99, stock: 120, barcode: "8901234567896", lowStockThreshold: 20 },
    { name: "Desk Lamp", description: "LED adjustable desk lamp", category: "Furniture", price: 34.99, stock: 6, barcode: "8901234567897", lowStockThreshold: 10 },
  ]);
  const savedProducts = await productRepo.save(products);
  console.log("✅ Products seeded");

  // Sales
  const saleRepo = AppDataSource.getRepository(Sale);
  const sales = saleRepo.create([
    { productId: savedProducts[0].id, productName: savedProducts[0].name, productCategory: "Electronics", quantity: 5, unitPrice: 149.99, totalPrice: 749.95 },
    { productId: savedProducts[3].id, productName: savedProducts[3].name, productCategory: "Electronics", quantity: 3, unitPrice: 89.99, totalPrice: 269.97 },
    { productId: savedProducts[6].id, productName: savedProducts[6].name, productCategory: "Stationery", quantity: 20, unitPrice: 12.99, totalPrice: 259.80 },
    { productId: savedProducts[1].id, productName: savedProducts[1].name, productCategory: "Electronics", quantity: 2, unitPrice: 49.99, totalPrice: 99.98 },
    { productId: savedProducts[5].id, productName: savedProducts[5].name, productCategory: "Electronics", quantity: 4, unitPrice: 119.99, totalPrice: 479.96 },
    { productId: savedProducts[2].id, productName: savedProducts[2].name, productCategory: "Furniture", quantity: 1, unitPrice: 299.99, totalPrice: 299.99 },
    { productId: savedProducts[7].id, productName: savedProducts[7].name, productCategory: "Furniture", quantity: 6, unitPrice: 34.99, totalPrice: 209.94 },
    { productId: savedProducts[0].id, productName: savedProducts[0].name, productCategory: "Electronics", quantity: 3, unitPrice: 149.99, totalPrice: 449.97 },
  ]);
  await saleRepo.save(sales);
  console.log("✅ Sales seeded");

  console.log("\n🎉 Seed complete!");
  console.log("Admin login:   admin@stockwise.com / admin123");
  console.log("Manager login: manager@stockwise.com / manager123");
  await AppDataSource.destroy();
}

seed().catch(console.error);
