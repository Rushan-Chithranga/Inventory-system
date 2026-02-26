import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "product_id", nullable: true })
  productId: number;

  @Column({ name: "product_name", length: 255 })
  productName: string;

  @Column({ name: "product_category", length: 100, nullable: true })
  productCategory: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: "total_price", type: "decimal", precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "sale_date" })
  saleDate: Date;
}
