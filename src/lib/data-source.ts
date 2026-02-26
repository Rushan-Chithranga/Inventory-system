import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "@/entities/Product";
import { Sale } from "@/entities/Sale";
import { User } from "@/entities/User";
import { Report } from "@/entities/Report";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "stockwise_db",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [Product, Sale, User, Report],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
  extra: {
    connectionLimit: 10,
  },
});

let initialized = false;

export async function getDataSource(): Promise<DataSource> {
  if (!initialized) {
    await AppDataSource.initialize();
    initialized = true;
  }
  return AppDataSource;
}
