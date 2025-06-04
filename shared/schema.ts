import { pgTable, text, serial, integer, boolean, timestamp, unique, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // admin, operator, engineer, viewer
  department: text("department"),
  position: text("position"),
  phone: text("phone"),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  permissions: text("permissions").array().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  progress: integer("progress").notNull().default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  campaignId: integer("campaign_id"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, overdue
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  reminderDate: timestamp("reminder_date"), // Date for reminder notification
  completedAt: timestamp("completed_at"),
  equipmentId: text("equipment_id"), // Link to equipment if task is equipment-related
  maintenanceType: text("maintenance_type"), // Type of maintenance task
  estimatedHours: integer("estimated_hours"), // Estimated completion time
  actualHours: integer("actual_hours"), // Actual time spent
  createdBy: text("created_by").notNull(), // Name of user who created the task
  lastModifiedBy: text("last_modified_by"), // Name of user who last modified the task
  completedBy: text("completed_by"), // Name of user who completed the task
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  tasksTotal: integer("tasks_total").notNull().default(0),
  onTimeRate: integer("on_time_rate").notNull().default(0),
  productivityScore: integer("productivity_score").notNull().default(0),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  resourceType: text("resource_type"),
  resourceId: integer("resource_id"),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  lastMaintenance: text("last_maintenance").notNull(),
  nextMaintenance: text("next_maintenance").notNull(),
  responsible: text("responsible").notNull(),
  maintenancePeriods: text("maintenance_periods").array().notNull().default([]),
  department: text("department").notNull(),
});

// Maintenance records table
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull(),
  equipmentName: text("equipment_name").notNull(),
  maintenanceType: text("maintenance_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  responsible: text("responsible").notNull(),
  status: text("status").notNull().default("scheduled"),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
  duration: text("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Remarks table
export const remarks = pgTable("remarks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  equipmentName: text("equipment_name").notNull(),
  equipmentId: text("equipment_id").notNull(),
  type: text("type").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  reportedBy: text("reported_by").notNull(),
  assignedTo: text("assigned_to").notNull(),
  lastModifiedBy: text("last_modified_by"), // Name of user who last modified the remark
  resolvedBy: text("resolved_by"), // Name of user who resolved the remark
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes").array().notNull().default([]),
});

// Inspection checklist items table
export const inspectionChecklists = pgTable("inspection_checklists", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull(),
  equipmentName: text("equipment_name").notNull(),
  checkItems: text("check_items").array().notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Daily inspection records table
export const dailyInspections = pgTable("daily_inspections", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull(),
  equipmentName: text("equipment_name").notNull(),
  inspectionDate: timestamp("inspection_date").notNull(),
  checkResults: text("check_results").array().notNull(), // Array of "ok", "issue", "critical"
  comments: text("comments").array().notNull().default([]),
  inspectedBy: text("inspected_by").notNull(),
  status: text("status").notNull().default("completed"), // "completed", "incomplete"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notifications table for task reminders and alerts
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "reminder", "overdue", "upcoming", "completed"
  taskId: integer("task_id"), // Reference to related task
  equipmentId: text("equipment_id"), // Reference to related equipment
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  isRead: boolean("is_read").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"), // When to show the notification
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertEquipmentSchema = createInsertSchema(equipment);
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true });
export const insertRemarkSchema = createInsertSchema(remarks).omit({ id: true });
export const insertInspectionChecklistSchema = createInsertSchema(inspectionChecklists).omit({ id: true });
export const insertDailyInspectionSchema = createInsertSchema(dailyInspections).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });

// Login Schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
  position: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type Remark = typeof remarks.$inferSelect;
export type InsertRemark = z.infer<typeof insertRemarkSchema>;
export type InspectionChecklist = typeof inspectionChecklists.$inferSelect;
export type InsertInspectionChecklist = z.infer<typeof insertInspectionChecklistSchema>;
export type DailyInspection = typeof dailyInspections.$inferSelect;
export type InsertDailyInspection = z.infer<typeof insertDailyInspectionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
