import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type ReportType = "Stock Level" | "Sales Summary" | "Purchase Report";
export type ReportStatus = "Good" | "Warning" | "High";

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: ["Stock Level", "Sales Summary", "Purchase Report"] })
  type: ReportType;

  @Column({ type: "text" })
  summary: string;

  @Column({ type: "json", nullable: true })
  data: Record<string, unknown>;

  @Column({
    type: "enum",
    enum: ["Good", "Warning", "High"],
    default: "Good",
  })
  status: ReportStatus;

  @Column({ name: "generated_by", nullable: true })
  generatedBy: number;

  @CreateDateColumn({ name: "generated_at" })
  generatedAt: Date;
}
