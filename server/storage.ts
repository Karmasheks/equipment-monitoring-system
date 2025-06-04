import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users, roles, campaigns, tasks, metrics, activities, equipment, maintenanceRecords,
  remarks, inspectionChecklists, dailyInspections, notifications,
  type User, type Role, type Campaign, type Task, type Metric, type Activity,
  type Equipment, type MaintenanceRecord, type Remark, type InspectionChecklist,
  type DailyInspection, type Notification,
  type InsertUser, type InsertRole, type InsertCampaign, type InsertTask,
  type InsertMetric, type InsertActivity, type InsertEquipment,
  type InsertMaintenanceRecord, type InsertRemark, type InsertInspectionChecklist,
  type InsertDailyInspection, type InsertNotification
} from "../shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Role operations
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTasksByCampaignId(campaignId: number): Promise<Task[]>;
  getTasksByEquipmentId(equipmentId: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  getUpcomingTasks(days: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  markTaskOverdue(taskId: number): Promise<Task | undefined>;
  
  // Metric operations
  getMetric(id: number): Promise<Metric | undefined>;
  getMetricByUserId(userId: number): Promise<Metric | undefined>;
  getAllMetrics(): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Equipment operations
  getEquipment(id: string): Promise<Equipment | undefined>;
  getAllEquipment(): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: string): Promise<boolean>;

  // Maintenance record operations
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getAllMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord(id: number): Promise<boolean>;

  // Remark operations
  getRemark(id: string): Promise<Remark | undefined>;
  getAllRemarks(): Promise<Remark[]>;
  createRemark(remark: InsertRemark): Promise<Remark>;
  updateRemark(id: string, remark: Partial<InsertRemark>): Promise<Remark | undefined>;
  deleteRemark(id: string): Promise<boolean>;

  // Inspection checklist operations
  getInspectionChecklist(id: number): Promise<InspectionChecklist | undefined>;
  getInspectionChecklistByEquipmentId(equipmentId: string): Promise<InspectionChecklist | undefined>;
  getAllInspectionChecklists(): Promise<InspectionChecklist[]>;
  createInspectionChecklist(checklist: InsertInspectionChecklist): Promise<InspectionChecklist>;
  updateInspectionChecklist(id: number, checklist: Partial<InsertInspectionChecklist>): Promise<InspectionChecklist | undefined>;
  deleteInspectionChecklist(id: number): Promise<boolean>;

  // Daily inspection operations
  getDailyInspection(id: number): Promise<DailyInspection | undefined>;
  getAllDailyInspections(): Promise<DailyInspection[]>;
  getDailyInspectionsByEquipmentId(equipmentId: string): Promise<DailyInspection[]>;
  getDailyInspectionsByDate(date: Date): Promise<DailyInspection[]>;
  createDailyInspection(inspection: InsertDailyInspection): Promise<DailyInspection>;
  updateDailyInspection(id: number, inspection: Partial<InsertDailyInspection>): Promise<DailyInspection | undefined>;
  deleteDailyInspection(id: number): Promise<boolean>;

  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getAllNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  getActiveNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<InsertNotification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  archiveNotification(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
}

export class PostgreSQLStorage implements IStorage {
  constructor() {}

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Equipment operations
  async getEquipment(id: string): Promise<Equipment | undefined> {
    const result = await db.select().from(equipment).where(eq(equipment.id, id));
    return result[0];
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const result = await db.insert(equipment).values(equipmentData).returning();
    return result[0];
  }

  async updateEquipment(id: string, updateData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const result = await db.update(equipment).set(updateData).where(eq(equipment.id, id)).returning();
    return result[0];
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.id, id)).returning();
    return result.length > 0;
  }

  // Maintenance record operations
  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const result = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return result[0];
  }

  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).orderBy(maintenanceRecords.scheduledDate);
  }

  async createMaintenanceRecord(recordData: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const result = await db.insert(maintenanceRecords).values(recordData).returning();
    return result[0];
  }

  async updateMaintenanceRecord(id: number, updateData: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const result = await db.update(maintenanceRecords).set(updateData).where(eq(maintenanceRecords.id, id)).returning();
    return result[0];
  }

  async deleteMaintenanceRecord(id: number): Promise<boolean> {
    const result = await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id)).returning();
    return result.length > 0;
  }

  // Remark operations
  async getRemark(id: string): Promise<Remark | undefined> {
    const result = await db.select().from(remarks).where(eq(remarks.id, parseInt(id)));
    return result[0];
  }

  async getAllRemarks(): Promise<Remark[]> {
    return await db.select().from(remarks).orderBy(desc(remarks.createdAt));
  }

  async createRemark(remarkData: InsertRemark): Promise<Remark> {
    const result = await db.insert(remarks).values(remarkData).returning();
    return result[0];
  }

  async updateRemark(id: string, updateData: Partial<InsertRemark>): Promise<Remark | undefined> {
    const result = await db.update(remarks).set(updateData).where(eq(remarks.id, parseInt(id))).returning();
    return result[0];
  }

  async deleteRemark(id: string): Promise<boolean> {
    try {
      const existingRemark = await db.select().from(remarks).where(eq(remarks.id, parseInt(id)));
      if (existingRemark.length === 0) {
        return false;
      }
      await db.delete(remarks).where(eq(remarks.id, parseInt(id)));
      return true;
    } catch (error) {
      console.error('Error deleting remark:', error);
      return false;
    }
  }

  // Inspection checklist operations
  async getInspectionChecklist(id: number): Promise<InspectionChecklist | undefined> {
    const result = await db.select().from(inspectionChecklists).where(eq(inspectionChecklists.id, id));
    return result[0];
  }

  async getInspectionChecklistByEquipmentId(equipmentId: string): Promise<InspectionChecklist | undefined> {
    const result = await db.select().from(inspectionChecklists).where(eq(inspectionChecklists.equipmentId, equipmentId));
    return result[0];
  }

  async getAllInspectionChecklists(): Promise<InspectionChecklist[]> {
    return await db.select().from(inspectionChecklists);
  }

  async createInspectionChecklist(checklistData: InsertInspectionChecklist): Promise<InspectionChecklist> {
    const result = await db.insert(inspectionChecklists).values(checklistData).returning();
    return result[0];
  }

  async updateInspectionChecklist(id: number, updateData: Partial<InsertInspectionChecklist>): Promise<InspectionChecklist | undefined> {
    const result = await db.update(inspectionChecklists).set(updateData).where(eq(inspectionChecklists.id, id)).returning();
    return result[0];
  }

  async deleteInspectionChecklist(id: number): Promise<boolean> {
    const result = await db.delete(inspectionChecklists).where(eq(inspectionChecklists.id, id)).returning();
    return result.length > 0;
  }

  // Daily inspection operations
  async getDailyInspection(id: number): Promise<DailyInspection | undefined> {
    const result = await db.select().from(dailyInspections).where(eq(dailyInspections.id, id));
    return result[0];
  }

  async getAllDailyInspections(): Promise<DailyInspection[]> {
    return await db.select().from(dailyInspections).orderBy(desc(dailyInspections.inspectionDate));
  }

  async getDailyInspectionsByEquipmentId(equipmentId: string): Promise<DailyInspection[]> {
    return await db.select().from(dailyInspections)
      .where(eq(dailyInspections.equipmentId, equipmentId))
      .orderBy(desc(dailyInspections.inspectionDate));
  }

  async getDailyInspectionsByDate(date: Date): Promise<DailyInspection[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select().from(dailyInspections)
      .where(and(
        gte(dailyInspections.inspectionDate, startOfDay),
        lte(dailyInspections.inspectionDate, endOfDay)
      ))
      .orderBy(dailyInspections.inspectionDate);
  }

  async createDailyInspection(inspectionData: InsertDailyInspection): Promise<DailyInspection> {
    const result = await db.insert(dailyInspections).values(inspectionData).returning();
    return result[0];
  }

  async updateDailyInspection(id: number, updateData: Partial<InsertDailyInspection>): Promise<DailyInspection | undefined> {
    const result = await db.update(dailyInspections).set(updateData).where(eq(dailyInspections.id, id)).returning();
    return result[0];
  }

  async deleteDailyInspection(id: number): Promise<boolean> {
    const result = await db.delete(dailyInspections).where(eq(dailyInspections.id, id)).returning();
    return result.length > 0;
  }

  // Role operations
  async getRole(id: number): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.name, name));
    return result[0];
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    const result = await db.insert(roles).values(roleData).returning();
    return result[0];
  }

  async updateRole(id: number, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    const result = await db.update(roles).set(updateData).where(eq(roles.id, id)).returning();
    return result[0];
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id)).returning();
    return result.length > 0;
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result[0];
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const result = await db.insert(campaigns).values(campaignData).returning();
    return result[0];
  }

  async updateCampaign(id: number, updateData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaigns).set(updateData).where(eq(campaigns.id, id)).returning();
    return result[0];
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByCampaignId(campaignId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.campaignId, campaignId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(taskData).returning();
    return result[0];
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updateData).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));
      if (existingTask.length === 0) {
        return false;
      }
      await db.delete(tasks).where(eq(tasks.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  async getTasksByEquipmentId(equipmentId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.equipmentId, equipmentId))
      .orderBy(desc(tasks.createdAt));
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.select().from(tasks)
      .where(and(
        eq(tasks.status, 'pending'),
        lte(tasks.dueDate, now)
      ))
      .orderBy(tasks.dueDate);
  }

  async getUpcomingTasks(days: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return await db.select().from(tasks)
      .where(and(
        eq(tasks.status, 'pending'),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, futureDate)
      ))
      .orderBy(tasks.dueDate);
  }

  async markTaskOverdue(taskId: number): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set({ status: 'overdue' })
      .where(eq(tasks.id, taskId))
      .returning();
    return result[0];
  }

  // Metric operations
  async getMetric(id: number): Promise<Metric | undefined> {
    const result = await db.select().from(metrics).where(eq(metrics.id, id));
    return result[0];
  }

  async getMetricByUserId(userId: number): Promise<Metric | undefined> {
    const result = await db.select().from(metrics).where(eq(metrics.userId, userId));
    return result[0];
  }

  async getAllMetrics(): Promise<Metric[]> {
    return await db.select().from(metrics);
  }

  async createMetric(metricData: InsertMetric): Promise<Metric> {
    const result = await db.insert(metrics).values(metricData).returning();
    return result[0];
  }

  async updateMetric(id: number, updateData: Partial<InsertMetric>): Promise<Metric | undefined> {
    const result = await db.update(metrics).set(updateData).where(eq(metrics.id, id)).returning();
    return result[0];
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result[0];
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.timestamp));
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.timestamp));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activityData).returning();
    return result[0];
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async getActiveNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isArchived, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notificationData).returning();
    return result[0];
  }

  async updateNotification(id: number, updateData: Partial<InsertNotification>): Promise<Notification | undefined> {
    const result = await db.update(notifications).set(updateData).where(eq(notifications.id, id)).returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  async archiveNotification(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isArchived: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new PostgreSQLStorage();