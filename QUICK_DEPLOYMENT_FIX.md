# Быстрое решение проблемы авторизации

## Проблема
При развертывании на другом сайте ошибка входа в систему из-за отсутствия базы данных PostgreSQL.

## Решение за 5 минут

### Шаг 1: Получите бесплатную базу данных
1. Перейдите на https://neon.tech
2. Зарегистрируйтесь (бесплатно)
3. Создайте новый проект
4. Скопируйте строку подключения DATABASE_URL

### Шаг 2: Настройте переменные окружения
Добавьте в настройки вашего хостинга:

```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-random-secret-key-here
SESSION_SECRET=another-random-secret-key
NODE_ENV=production
```

### Шаг 3: Создайте таблицы
После первого деплоя выполните:
```bash
npm run db:push
```

### Шаг 4: Создайте первого пользователя
Подключитесь к базе данных и выполните:
```sql
INSERT INTO users (name, email, password, role, department, position, created_at) 
VALUES ('Админ', 'admin@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ИТ', 'Администратор', NOW());
```

Данные для входа:
- Email: admin@test.ru  
- Пароль: password

## Альтернативные хостинги для базы данных
- Supabase.com (бесплатно)
- Railway.app (есть бесплатный тариф)
- Aiven.io (бесплатный тариф)

## Если не работает
1. Проверьте правильность DATABASE_URL
2. Убедитесь, что база данных доступна извне
3. Проверьте, что все переменные окружения установлены
4. Проверьте логи приложения на хостинге