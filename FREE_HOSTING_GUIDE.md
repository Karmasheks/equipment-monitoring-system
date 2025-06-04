# Бесплатное развертывание: Подробное руководство

## Обзор бесплатных платформ

| Платформа | База данных | Лимиты | Сложность |
|-----------|-------------|---------|-----------|
| Railway | PostgreSQL бесплатно | 500 часов/месяц | Легко |
| Render | PostgreSQL бесплатно | Засыпает через 15 мин | Средне |
| Vercel + Supabase | PostgreSQL бесплатно | Статичные файлы | Средне |
| Netlify + PlanetScale | MySQL бесплатно | Только фронтенд | Сложно |

## Вариант 1: Railway (РЕКОМЕНДУЕТСЯ)

### Почему Railway?
- Простая настройка
- Автоматическое развертывание
- Бесплатная PostgreSQL база данных
- Хорошая документация на русском

### Пошаговая инструкция

#### Шаг 1: Подготовка кода
1. Создайте аккаунт на https://github.com/ (если нет)
2. Создайте новый репозиторий (кнопка "New repository")
3. Назовите его `equipment-monitoring-system`
4. Загрузите все файлы проекта в репозиторий

#### Шаг 2: Регистрация в Railway
1. Перейдите на https://railway.app/
2. Нажмите "Login" → "Login with GitHub"
3. Разрешите доступ Railway к вашему GitHub

#### Шаг 3: Создание проекта
1. На главной странице Railway нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите репозиторий `equipment-monitoring-system`
4. Нажмите "Deploy Now"

#### Шаг 4: Добавление базы данных
1. В вашем проекте нажмите "New" → "Database" → "Add PostgreSQL"
2. База данных создастся автоматически
3. Перейдите во вкладку "Variables" базы данных
4. Скопируйте значение `DATABASE_URL`

#### Шаг 5: Настройка переменных приложения
1. Нажмите на ваше приложение (не базу данных)
2. Перейдите во вкладку "Variables"
3. Добавьте переменные:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secret-key-12345
   PORT=5000
   ```
4. `DATABASE_URL` добавится автоматически при связывании с базой

#### Шаг 6: Восстановление данных
1. Получите DATABASE_URL из Railway (вкладка Variables)
2. На своем компьютере выполните:
   ```bash
   psql "postgresql://postgres:password@server:port/database" < database_backup.sql
   ```
   Замените адрес на ваш DATABASE_URL

#### Шаг 7: Проверка
1. Перейдите во вкладку "Deployments"
2. Дождитесь завершения развертывания (зеленая галочка)
3. Нажмите на URL приложения
4. Проверьте работу системы

## Вариант 2: Render

### Шаг 1: Подготовка
1. Код уже должен быть на GitHub
2. Зарегистрируйтесь на https://render.com/

### Шаг 2: Создание базы данных
1. В Render нажмите "New" → "PostgreSQL"
2. Настройки:
   - Name: `equipment-monitoring-db`
   - Database: `equipment_monitoring`
   - User: `admin`
   - Plan: Free
3. Нажмите "Create Database"
4. Дождитесь создания и скопируйте "External Database URL"

### Шаг 3: Создание веб-сервиса
1. Нажмите "New" → "Web Service"
2. Подключите GitHub репозиторий
3. Настройки:
   - Name: `equipment-monitoring`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

### Шаг 4: Переменные окружения
```
NODE_ENV=production
DATABASE_URL=[ваш External Database URL]
SESSION_SECRET=your-secret-key-12345
PORT=10000
```

### Шаг 5: Восстановление данных
```bash
psql "[External Database URL]" < database_backup.sql
```

## Вариант 3: Vercel + Supabase

### Шаг 1: Подготовка к Vercel
1. Зарегистрируйтесь на https://vercel.com/
2. Подключите GitHub аккаунт

### Шаг 2: Настройка Supabase (база данных)
1. Перейдите на https://supabase.com/
2. Создайте новый проект
3. Дождитесь инициализации
4. Перейдите в Settings → Database
5. Скопируйте Connection string

### Шаг 3: Изменение кода для Vercel
Создайте файл `vercel.json` в корне проекта:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

### Шаг 4: Развертывание в Vercel
1. Импортируйте проект из GitHub
2. Добавьте переменные окружения:
   ```
   DATABASE_URL=[Supabase connection string]
   NODE_ENV=production
   SESSION_SECRET=your-secret-key
   ```

## Вариант 4: Heroku (платно, но с бесплатным триалом)

### Шаг 1: Установка Heroku CLI
```bash
# Windows (через Chocolatey)
choco install heroku-cli

# macOS (через Homebrew)
brew install heroku/brew/heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Шаг 2: Подготовка проекта
Создайте файл `Procfile` в корне:
```
web: npm start
```

Создайте файл `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "heroku-postbuild": "npm run build"
  }
}
```

### Шаг 3: Развертывание
```bash
heroku login
heroku create equipment-monitoring-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## Сравнение и рекомендации

### Для новичков: Railway
**Плюсы:**
- Максимально простая настройка
- Автоматическое связывание с базой данных
- Хорошая бесплатная квота
- Понятный интерфейс

**Минусы:**
- Ограничения бесплатного плана

### Для продвинутых: Render
**Плюсы:**
- Более гибкие настройки
- Хорошая производительность
- Автоматические бэкапы

**Минусы:**
- Приложение засыпает через 15 минут бездействия
- Более сложная настройка

### Для масштабирования: Vercel + Supabase
**Плюсы:**
- Отличная производительность
- Глобальная CDN
- Продвинутые возможности базы данных

**Минусы:**
- Требует изменения архитектуры
- Более сложная настройка

## Устранение проблем

### Проблема: "Build failed"
**Решение:**
1. Проверьте package.json на наличие всех зависимостей
2. Убедитесь, что build команды корректны
3. Проверьте логи сборки

### Проблема: "Database connection failed"
**Решение:**
1. Проверьте правильность DATABASE_URL
2. Убедитесь, что база данных запущена
3. Проверьте права доступа

### Проблема: "502 Bad Gateway"
**Решение:**
1. Проверьте, что приложение слушает правильный порт
2. Убедитесь, что процесс запускается без ошибок
3. Проверьте переменную PORT

## Мониторинг и поддержка

### Логи приложения
- **Railway**: Вкладка "Deployments" → "View Logs"
- **Render**: Вкладка "Logs" в сервисе
- **Vercel**: Functions → View Function Logs

### Метрики производительности
- **Railway**: Вкладка "Metrics"
- **Render**: Вкладка "Metrics"
- **Vercel**: Analytics (в платных планах)

### Бэкапы базы данных
```bash
# Автоматический бэкап (запускать периодически)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Рекомендации по безопасности

1. **Никогда не коммитьте файлы .env**
2. **Используйте сложные SESSION_SECRET**
3. **Регулярно обновляйте зависимости**:
   ```bash
   npm audit fix
   ```
4. **Настройте HTTPS** (обычно автоматически на всех платформах)
5. **Ограничьте доступ к базе данных** только для вашего приложения

Выберите платформу в зависимости от ваших потребностей и уровня технических знаний. Railway рекомендуется для быстрого старта, а Render или Vercel - для более серьезных проектов.