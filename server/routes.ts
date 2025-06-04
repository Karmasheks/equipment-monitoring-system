import type { Express, Request, Response } from "express";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_session_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Auth middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
  
  // Require role middleware
  const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: Function) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
      
      next();
    };
  };
  
  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with viewer role by default
      const user = await storage.createUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "viewer", // Новые пользователи получают только права просмотра
        position: userData.position,
        isActive: true,
      });
      
      // Create activity for user registration
      await storage.createActivity({
        userId: user.id,
        action: "Пользователь зарегистрировался",
        timestamp: new Date(),
        resourceType: "user",
        resourceId: user.id,
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      // Return user without password and token
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "Регистрация успешна! Вы получили права просмотра. Для расширения прав обратитесь к администратору."
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Ошибка регистрации" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      // Create login activity
      await storage.createActivity({
        userId: user.id,
        action: "User logged in",
        timestamp: new Date(),
        resourceType: "user",
        resourceId: user.id,
      });
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // USER ROUTES - этот эндпоинт удален, используется реальный ниже
  
  // ROLE ROUTES
  app.get("/api/roles", authenticate, requireRole(["admin"]), async (_, res) => {
    try {
      const roles = await storage.getAllRoles();
      return res.status(200).json(roles);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/roles", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const role = await storage.createRole(req.body);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Created role",
        timestamp: new Date(),
        resourceType: "role",
        resourceId: role.id,
      });
      
      return res.status(201).json(role);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/roles/:id", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const updatedRole = await storage.updateRole(roleId, req.body);
      
      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Updated role",
        timestamp: new Date(),
        resourceType: "role",
        resourceId: roleId,
      });
      
      return res.status(200).json(updatedRole);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // CAMPAIGN ROUTES
  app.get("/api/campaigns", authenticate, async (_, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      return res.status(200).json(campaigns);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/campaigns", authenticate, requireRole(["admin", "marketing_manager"]), async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Created campaign",
        timestamp: new Date(),
        resourceType: "campaign",
        resourceId: campaign.id,
      });
      
      return res.status(201).json(campaign);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/campaigns/:id", authenticate, requireRole(["admin", "marketing_manager"]), async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updatedCampaign = await storage.updateCampaign(campaignId, req.body);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Updated campaign",
        timestamp: new Date(),
        resourceType: "campaign",
        resourceId: campaignId,
      });
      
      return res.status(200).json(updatedCampaign);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // TASK ROUTES
  app.get("/api/tasks", authenticate, async (req, res) => {
    try {
      let tasks;
      
      if (req.query.userId) {
        tasks = await storage.getTasksByUserId(parseInt(req.query.userId as string));
      } else if (req.query.campaignId) {
        tasks = await storage.getTasksByCampaignId(parseInt(req.query.campaignId as string));
      } else {
        tasks = await storage.getAllTasks();
      }
      
      return res.status(200).json(tasks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/tasks", authenticate, async (req, res) => {
    try {
      console.log('Received task data:', req.body);
      
      // Обрабатываем даты правильно и обязательные поля
      const taskData = {
        ...req.body,
        userId: req.user.id,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        reminderDate: req.body.reminderDate ? new Date(req.body.reminderDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Processed task data:', taskData);
      
      const task = await storage.createTask(taskData);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Created task",
        timestamp: new Date(),
        resourceType: "task",
        resourceId: task.id,
      });
      
      return res.status(201).json(task);
    } catch (error: any) {
      console.error('Task creation error:', error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/tasks/:id", authenticate, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      // Check if user is authorized to update the task
      if (task && task.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "marketing_manager") {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      console.log('Received task update data:', req.body);
      
      // Обрабатываем даты правильно
      const taskUpdateData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        reminderDate: req.body.reminderDate ? new Date(req.body.reminderDate) : null,
      };
      
      console.log('Processed task update data:', taskUpdateData);
      
      const updatedTask = await storage.updateTask(taskId, taskUpdateData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: `Updated task ${req.body.status === "completed" ? "to completed" : ""}`,
        timestamp: new Date(),
        resourceType: "task",
        resourceId: taskId,
      });
      
      return res.status(200).json(updatedTask);
    } catch (error: any) {
      console.error('Task update error:', error);
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/tasks/:id", authenticate, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      // Check if user is authorized to delete the task
      if (task && task.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "marketing_manager") {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
      
      const deleted = await storage.deleteTask(taskId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Deleted task",
        timestamp: new Date(),
        resourceType: "task",
        resourceId: taskId,
      });
      
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Task statistics route
  app.get("/api/tasks/stats", authenticate, async (req, res) => {
    try {
      const allTasks = await storage.getAllTasks();
      
      const stats = {
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        inProgress: allTasks.filter(t => t.status === 'in_progress').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        overdue: allTasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          return new Date(t.dueDate) < new Date();
        }).length,
      };
      
      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // METRICS ROUTES
  app.get("/api/metrics", authenticate, requireRole(["admin", "marketing_manager"]), async (_, res) => {
    try {
      const metrics = await storage.getAllMetrics();
      return res.status(200).json(metrics);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/metrics/:userId", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Only admins, marketing managers, or the user themselves can view their metrics
      if (req.user.id !== userId && req.user.role !== "admin" && req.user.role !== "marketing_manager") {
        return res.status(403).json({ message: "Not authorized to view these metrics" });
      }
      
      const metrics = await storage.getMetricByUserId(userId);
      
      if (!metrics) {
        return res.status(404).json({ message: "Metrics not found for this user" });
      }
      
      return res.status(200).json(metrics);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // USER ROUTES
  app.get("/api/users", authenticate, async (req, res) => {
    try {
      // Only admin can see all users
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
      
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json(usersWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Create new user
  app.post("/api/users", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Created user",
        timestamp: new Date(),
        resourceType: "user",
        resourceId: user.id,
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Update user
  app.put("/api/users/:id", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Updated user",
        timestamp: new Date(),
        resourceType: "user",
        resourceId: userId,
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Delete user
  app.delete("/api/users/:id", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Нельзя удалить собственную учетную запись" });
      }
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.id,
        action: "Deleted user",
        timestamp: new Date(),
        resourceType: "user",
        resourceId: userId,
      });
      
      return res.status(200).json({ message: "Пользователь успешно удален" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ACTIVITY ROUTES
  app.get("/api/activities", authenticate, async (req, res) => {
    try {
      let activities;
      
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        
        // Only admins, marketing managers, or the user themselves can view their activities
        if (req.user.id !== userId && req.user.role !== "admin" && req.user.role !== "marketing_manager") {
          return res.status(403).json({ message: "Not authorized to view these activities" });
        }
        
        activities = await storage.getActivitiesByUserId(userId);
      } else if (req.user.role === "admin" || req.user.role === "marketing_manager") {
        activities = await storage.getAllActivities();
      } else {
        activities = await storage.getActivitiesByUserId(req.user.id);
      }
      
      return res.status(200).json(activities);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // DASHBOARD DATA
  app.get("/api/dashboard", authenticate, async (req, res) => {
    try {
      // Get campaigns
      const campaigns = await storage.getAllCampaigns();
      
      // Get user metrics (for team performance)
      const metrics = await storage.getAllMetrics();
      
      // Get recent activities
      const activities = await storage.getAllActivities();
      
      // Get roles
      const roles = await storage.getAllRoles();
      
      // Generate sample performance data (would be calculated from real metrics in a production app)
      const performanceData = {
        campaigns: campaigns.length,
        campaignsChange: 8,
        openTasks: 42,
        openTasksChange: 12,
        conversionRate: 3.2,
        conversionRateChange: 0.8,
        teamProductivity: 87,
        teamProductivityChange: 5,
        teamMembers: [
          {
            id: 1,
            name: "Jane Doe",
            email: "jane.doe@example.com",
            role: "Marketing Manager",
            tasksCompleted: 24,
            tasksTotal: 30,
            onTimeRate: 92,
            productivityScore: 90,
            avatar: "JD"
          },
          {
            id: 2,
            name: "Mike Smith",
            email: "mike.smith@example.com",
            role: "Content Creator",
            tasksCompleted: 18,
            tasksTotal: 25,
            onTimeRate: 78,
            productivityScore: 72,
            avatar: "MS"
          },
          {
            id: 3,
            name: "Anna Roberts",
            email: "anna.roberts@example.com",
            role: "Social Media Specialist",
            tasksCompleted: 32,
            tasksTotal: 35,
            onTimeRate: 94,
            productivityScore: 95,
            avatar: "AR"
          }
        ]
      };
      
      return res.status(200).json({
        campaigns,
        metrics,
        activities: activities.slice(0, 10), // Latest 10 activities
        roles,
        performanceData
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // EQUIPMENT ROUTES
  app.get("/api/equipment", authenticate, async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      return res.status(200).json(equipment);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/equipment", authenticate, async (req, res) => {
    try {
      const equipment = await storage.createEquipment(req.body);
      return res.status(201).json(equipment);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/equipment/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const equipment = await storage.updateEquipment(id, req.body);
      if (!equipment) {
        return res.status(404).json({ message: "Оборудование не найдено" });
      }
      return res.status(200).json(equipment);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/equipment/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEquipment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Оборудование не найдено" });
      }
      return res.status(200).json({ message: "Оборудование удалено" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // MAINTENANCE RECORDS ROUTES
  app.get("/api/maintenance", authenticate, async (req, res) => {
    try {
      const records = await storage.getAllMaintenanceRecords();
      return res.status(200).json(records);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/maintenance", authenticate, async (req, res) => {
    try {
      // Преобразуем строковые даты в объекты Date
      const processedData = {
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate),
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
      };
      
      const record = await storage.createMaintenanceRecord(processedData);
      return res.status(201).json(record);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/maintenance/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Преобразуем строковые даты в объекты Date
      const processedData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
      };
      
      const record = await storage.updateMaintenanceRecord(id, processedData);
      if (!record) {
        return res.status(404).json({ message: "Запись о техобслуживании не найдена" });
      }
      return res.status(200).json(record);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/maintenance/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMaintenanceRecord(id);
      if (!deleted) {
        return res.status(404).json({ message: "Запись о техобслуживании не найдена" });
      }
      return res.status(200).json({ message: "Запись удалена" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // REMARKS ROUTES
  app.get("/api/remarks", authenticate, async (req, res) => {
    try {
      const remarks = await storage.getAllRemarks();
      return res.status(200).json(remarks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/remarks", authenticate, async (req, res) => {
    try {
      const remark = await storage.createRemark(req.body);
      return res.status(201).json(remark);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/remarks/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const remark = await storage.updateRemark(id, req.body);
      if (!remark) {
        return res.status(404).json({ message: "Замечание не найдено" });
      }
      return res.status(200).json(remark);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/remarks/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRemark(id);
      if (!deleted) {
        return res.status(404).json({ message: "Замечание не найдено" });
      }
      return res.status(200).json({ message: "Замечание удалено" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // INSPECTION CHECKLISTS ROUTES
  app.get("/api/inspection-checklists", authenticate, async (req, res) => {
    try {
      const checklists = await storage.getAllInspectionChecklists();
      return res.status(200).json(checklists);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inspection-checklists/:equipmentId", authenticate, async (req, res) => {
    try {
      const { equipmentId } = req.params;
      const checklist = await storage.getInspectionChecklistByEquipmentId(equipmentId);
      if (!checklist) {
        return res.status(404).json({ message: "Чек-лист для данного оборудования не найден" });
      }
      return res.status(200).json(checklist);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inspection-checklists", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const checklistData = {
        ...req.body,
        createdBy: req.user?.name || req.body.createdBy || 'Администратор',
      };
      const checklist = await storage.createInspectionChecklist(checklistData);
      return res.status(201).json(checklist);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/inspection-checklists/:id", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const checklist = await storage.updateInspectionChecklist(id, req.body);
      if (!checklist) {
        return res.status(404).json({ message: "Чек-лист не найден" });
      }
      return res.status(200).json(checklist);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/inspection-checklists/:id", authenticate, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInspectionChecklist(id);
      if (!deleted) {
        return res.status(404).json({ message: "Чек-лист не найден" });
      }
      return res.status(200).json({ message: "Чек-лист удален" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // DAILY INSPECTIONS ROUTES
  app.get("/api/daily-inspections", authenticate, async (req, res) => {
    try {
      const inspections = await storage.getAllDailyInspections();
      return res.status(200).json(inspections);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/daily-inspections/equipment/:equipmentId", authenticate, async (req, res) => {
    try {
      const { equipmentId } = req.params;
      const inspections = await storage.getDailyInspectionsByEquipmentId(equipmentId);
      return res.status(200).json(inspections);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/daily-inspections", authenticate, async (req, res) => {
    try {
      const inspectionData = {
        ...req.body,
        inspectedBy: req.user?.name || req.body.inspectedBy || 'Неизвестно',
        inspectionDate: new Date(req.body.inspectionDate),
      };
      const inspection = await storage.createDailyInspection(inspectionData);
      return res.status(201).json(inspection);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/daily-inspections/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inspectionData = {
        ...req.body,
        inspectionDate: req.body.inspectionDate ? new Date(req.body.inspectionDate) : undefined,
      };
      const inspection = await storage.updateDailyInspection(id, inspectionData);
      if (!inspection) {
        return res.status(404).json({ message: "Осмотр не найден" });
      }
      return res.status(200).json(inspection);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/daily-inspections/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDailyInspection(id);
      if (!deleted) {
        return res.status(404).json({ message: "Осмотр не найден" });
      }
      return res.status(200).json({ message: "Осмотр удален" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  return httpServer;
}
