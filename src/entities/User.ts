import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type UserRole = "Admin" | "Store Manager";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    type: "enum",
    enum: ["Admin", "Store Manager"],
    default: "Store Manager",
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: "last_login", nullable: true, type: "datetime" })
  lastLogin: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
