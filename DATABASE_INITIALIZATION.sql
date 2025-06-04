-- Инициализация базы данных для системы мониторинга оборудования
-- Выполните этот скрипт после создания базы данных PostgreSQL

-- Создание тестового администратора
INSERT INTO users (name, email, password, role, department, position, created_at) VALUES 
('Администратор', 'admin@company.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ИТ отдел', 'Системный администратор', NOW());

-- Пароль для входа: "password"
-- Обязательно смените пароль после первого входа в систему!

-- Создание базовых ролей
INSERT INTO roles (name, description, permissions, created_at) VALUES
('admin', 'Администратор системы', '["read", "write", "delete", "admin"]', NOW()),
('technician', 'Техник по обслуживанию', '["read", "write"]', NOW()),
('operator', 'Оператор оборудования', '["read"]', NOW());

-- Создание примера оборудования (опционально)
INSERT INTO equipment (id, name, type, manufacturer, model, installation_date, status, location, created_at) VALUES
('TEST001', 'Тестовое оборудование', 'test_equipment', 'Test Manufacturer', 'Model 1', NOW(), 'working', 'Тестовый участок', NOW());

-- Проверка создания данных
SELECT 'Пользователи:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Роли:', COUNT(*) FROM roles
UNION ALL  
SELECT 'Оборудование:', COUNT(*) FROM equipment;