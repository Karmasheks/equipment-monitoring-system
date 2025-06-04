# Настройка развертывания системы мониторинга оборудования

## Обязательные требования для развертывания

### 1. База данных PostgreSQL

Система требует подключения к PostgreSQL базе данных. Настройте одним из способов:

#### Вариант А: Облачная база данных (рекомендуется)
- **Neon.tech** (бесплатно до 1GB): https://neon.tech
- **Supabase** (бесплатно до 500MB): https://supabase.com
- **Railway** (платно): https://railway.app
- **Heroku Postgres** (платно): https://www.heroku.com/postgres

#### Вариант Б: Локальная установка PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# MacOS с Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Скачайте с https://www.postgresql.org/download/windows/
```

### 2. Переменные окружения (.env файл)

Создайте файл `.env` в корне проекта:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database_name
PGHOST=your_postgres_host
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database_name

# Application Configuration
NODE_ENV=production
PORT=5000

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-here

# Session Secret (сгенерируйте случайную строку)
SESSION_SECRET=your-session-secret-key-here
```

### 3. Создание базы данных

#### Подключитесь к PostgreSQL:
```bash
psql -h your_host -U your_username -d postgres
```

#### Создайте базу данных:
```sql
CREATE DATABASE equipment_monitoring;
\q
```

### 4. Инициализация схемы базы данных

После настройки переменных окружения:

```bash
# Установите зависимости
npm install

# Создайте таблицы в базе данных
npm run db:push
```

### 5. Заполнение начальными данными

Выполните SQL скрипт для создания тестовых пользователей:

```sql
-- Создание тестового пользователя администратора
INSERT INTO users (name, email, password, role, department, position) VALUES 
('Администратор', 'admin@company.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ИТ отдел', 'Системный администратор');

-- Пароль для тестового пользователя: "password"
-- В production обязательно смените на надежный пароль
```

## Пошаговая настройка для популярных платформ

### Vercel
1. Подключите GitHub репозиторий к Vercel
2. В настройках проекта добавьте переменные окружения из `.env`
3. Настройте базу данных через Neon или Supabase
4. Деплой произойдет автоматически

### Netlify
1. Подключите GitHub репозиторий
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Добавьте переменные окружения в настройках

### Railway
1. Подключите GitHub репозиторий
2. Railway автоматически создаст PostgreSQL базу
3. Переменная DATABASE_URL будет настроена автоматически

### Heroku
1. Создайте приложение: `heroku create your-app-name`
2. Добавьте PostgreSQL: `heroku addons:create heroku-postgresql:mini`
3. Настройте переменные окружения через Heroku Dashboard

## Проверка правильности настройки

### 1. Проверка подключения к базе данных
```bash
# Проверьте доступность базы данных
psql $DATABASE_URL -c "SELECT version();"
```

### 2. Проверка переменных окружения
```bash
# Убедитесь, что все переменные установлены
echo $DATABASE_URL
echo $JWT_SECRET
echo $SESSION_SECRET
```

### 3. Тестовый запуск
```bash
npm run dev
# Должен запуститься без ошибок подключения к БД
```

## Безопасность в production

### Обязательно настройте:
1. **Надежные пароли** для базы данных
2. **Уникальные секретные ключи** JWT и сессий
3. **HTTPS соединение** для production
4. **Ограничения доступа** к базе данных по IP
5. **Резервное копирование** базы данных

### Генерация секретных ключей:
```bash
# Для JWT_SECRET и SESSION_SECRET используйте:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Частые ошибки и решения

### Ошибка: "database does not exist"
**Решение**: Создайте базу данных с именем, указанным в DATABASE_URL

### Ошибка: "authentication failed"
**Решение**: Проверьте правильность username/password в DATABASE_URL

### Ошибка: "connection refused"
**Решение**: Проверьте доступность хоста и порта базы данных

### Ошибка: "Invalid or expired token"
**Решение**: Убедитесь, что JWT_SECRET настроен правильно

## Контакты для поддержки

При возникновении проблем с развертыванием создайте issue в GitHub репозитории с подробным описанием ошибки.