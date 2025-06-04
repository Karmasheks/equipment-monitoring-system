import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL!;

// Create the connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Initialize database using Drizzle ORM
export async function initializeDatabase() {
  try {
    console.log("Database initialized successfully (using Drizzle schema)");
    
    // Seeding disabled - real data restored manually
    // await seedInitialData();
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Seed initial data for the system using Drizzle ORM
async function seedInitialData() {
  try {
    const { users, equipment, maintenanceRecords, remarks } = await import('../shared/schema');
    
    // Check if data already exists
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("Database already contains data, skipping seed");
      return;
    }

    // Create default users using Drizzle
    const bcrypt = await import('bcryptjs');
    
    const usersData = [
      {
        name: 'Купцов Денис',
        email: 'admin@starline.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Техническая служба',
        position: 'Старший инженер'
      },
      {
        name: 'Иванов Сергей',
        email: 'ivanov@starline.com',
        password: await bcrypt.hash('user123', 10),
        role: 'engineer',
        department: 'Механический цех',
        position: 'Инженер-механик'
      },
      {
        name: 'Петрова Анна',
        email: 'petrova@starline.com',
        password: await bcrypt.hash('user123', 10),
        role: 'technician',
        department: 'Энергетический цех',
        position: 'Техник-электрик'
      },
      {
        name: 'Сидоров Михаил',
        email: 'sidorov@starline.com',
        password: await bcrypt.hash('user123', 10),
        role: 'operator',
        department: 'Сварочный участок',
        position: 'Оператор сварочного оборудования'
      }
    ];

    await db.insert(users).values(usersData);

    // Insert real equipment data using Drizzle
    const equipmentData = [
      {
        id: 'EQ001',
        name: 'Станок токарно-винторезный 16К20',
        type: 'Металлообрабатывающий станок',
        description: 'Токарно-винторезный станок для обработки деталей диаметром до 400мм',
        status: 'active',
        lastMaintenance: '2024-11-15',
        nextMaintenance: '2025-02-15',
        responsible: 'Купцов Денис',
        maintenancePeriods: ['1M-TO', '3M-TO', '6M-TO', '1G-TO'],
        department: 'Механический цех'
      },
      {
        id: 'EQ002',
        name: 'Фрезерный станок 6Р13',
        type: 'Металлообрабатывающий станок',
        description: 'Универсальный фрезерный станок для обработки заготовок',
        status: 'active',
        lastMaintenance: '2024-10-20',
        nextMaintenance: '2025-01-20',
        responsible: 'Купцов Денис',
        maintenancePeriods: ['1M-TO', '3M-TO', '6M-TO', '1G-TO'],
        department: 'Механический цех'
      },
      {
        id: 'EQ003',
        name: 'Компрессор винтовой АС-20',
        type: 'Компрессорное оборудование',
        description: 'Винтовой компрессор производительностью 20 м³/мин',
        status: 'active',
        lastMaintenance: '2024-12-01',
        nextMaintenance: '2025-03-01',
        responsible: 'Купцов Денис',
        maintenancePeriods: ['1M-TO', '3M-TO', '6M-TO', '1G-TO'],
        department: 'Энергетический цех'
      },
      {
        id: 'EQ004',
        name: 'Кран мостовой 5т',
        type: 'Подъемно-транспортное оборудование',
        description: 'Мостовой кран грузоподъемностью 5 тонн',
        status: 'active',
        lastMaintenance: '2024-11-10',
        nextMaintenance: '2025-02-10',
        responsible: 'Купцов Денис',
        maintenancePeriods: ['1M-TO', '3M-TO', '6M-TO', '1G-TO'],
        department: 'Механический цех'
      },
      {
        id: 'EQ005',
        name: 'Сварочный аппарат САК-40',
        type: 'Сварочное оборудование',
        description: 'Сварочный автомат для дуговой сварки',
        status: 'maintenance',
        lastMaintenance: '2024-11-25',
        nextMaintenance: '2025-02-25',
        responsible: 'Купцов Денис',
        maintenancePeriods: ['1M-TO', '3M-TO', '6M-TO', '1G-TO'],
        department: 'Сварочный участок'
      }
    ];

    await db.insert(equipment).values(equipmentData);

    // Insert maintenance records using Drizzle
    const maintenanceData = [
      {
        equipmentName: 'Станок токарно-винторезный 16К20',
        equipmentId: 'EQ001',
        maintenanceType: '1M-TO',
        scheduledDate: new Date('2025-01-15'),
        duration: '2 часа',
        responsible: 'Купцов Денис',
        status: 'scheduled',
        priority: 'medium'
      },
      {
        equipmentName: 'Фрезерный станок 6Р13',
        equipmentId: 'EQ002',
        maintenanceType: '3M-TO',
        scheduledDate: new Date('2025-01-20'),
        duration: '4 часа',
        responsible: 'Купцов Денис',
        status: 'scheduled',
        priority: 'medium'
      },
      {
        equipmentName: 'Компрессор винтовой АС-20',
        equipmentId: 'EQ003',
        maintenanceType: '1M-TO',
        scheduledDate: new Date('2025-01-01'),
        duration: '1 час',
        responsible: 'Купцов Денис',
        status: 'completed',
        priority: 'high'
      },
      {
        equipmentName: 'Сварочный аппарат САК-40',
        equipmentId: 'EQ005',
        maintenanceType: '6M-TO',
        scheduledDate: new Date('2024-12-25'),
        duration: '6 часов',
        responsible: 'Купцов Денис',
        status: 'in_progress',
        priority: 'high'
      }
    ];

    await db.insert(maintenanceRecords).values(maintenanceData);

    // Insert sample remarks using Drizzle (without id since it's serial)
    const remarksData = [
      {
        title: 'Повышенная вибрация',
        description: 'Обнаружена повышенная вибрация в главном шпинделе токарного станка',
        equipmentName: 'Станок токарно-винторезный 16К20',
        equipmentId: 'EQ001',
        type: 'inspection',
        priority: 'medium',
        status: 'open',
        reportedBy: 'Купцов Денис',
        assignedTo: 'Купцов Денис',
        notes: ['Требуется проверка подшипников', 'Планируется замена в следующем ТО']
      },
      {
        title: 'Утечка масла',
        description: 'Обнаружена небольшая утечка гидравлического масла',
        equipmentName: 'Фрезерный станок 6Р13',
        equipmentId: 'EQ002',
        type: 'maintenance',
        priority: 'low',
        status: 'in_progress',
        reportedBy: 'Купцов Денис',
        assignedTo: 'Купцов Денис',
        notes: ['Заказаны новые уплотнения']
      }
    ];

    await db.insert(remarks).values(remarksData);

    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}