# Руководство по развертыванию проекта

## Экспорт проекта

### 1. Архивирование исходного кода
```bash
# Создать архив проекта (исключая node_modules и временные файлы)
tar -czf equipment-monitoring-system.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=build \
  --exclude=.env \
  .
```

### 2. Экспорт базы данных PostgreSQL
```bash
# Создать дамп базы данных
pg_dump $DATABASE_URL > database_backup.sql

# Или через переменные окружения
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE > database_backup.sql
```

## Развертывание на новом сервере

### 1. Предварительные требования
- Node.js 18+ или 20+
- PostgreSQL 12+
- npm или yarn

### 2. Установка зависимостей
```bash
# Распаковать архив
tar -xzf equipment-monitoring-system.tar.gz
cd equipment-monitoring-system

# Установить зависимости
npm install
```

### 3. Настройка базы данных
```bash
# Создать новую базу данных
createdb equipment_monitoring

# Восстановить данные из дампа
psql -h localhost -p 5432 -U postgres -d equipment_monitoring < database_backup.sql
```

### 4. Настройка переменных окружения
Создать файл `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/equipment_monitoring
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=equipment_monitoring
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secret-key-here
```

### 5. Сборка и запуск
```bash
# Сборка проекта
npm run build

# Запуск в продакшене
npm start

# Или в режиме разработки
npm run dev
```

## Альтернативные платформы для развертывания

### 1. Vercel
```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть проект
vercel --prod
```

### 2. Netlify
```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Развернуть проект
netlify deploy --prod
```

### 3. Railway
```bash
# Установить Railway CLI
npm i -g @railway/cli

# Войти и развернуть
railway login
railway deploy
```

### 4. DigitalOcean App Platform
1. Подключить GitHub репозиторий
2. Настроить переменные окружения
3. Автоматическое развертывание

### 5. AWS EC2 / Azure / Google Cloud
```bash
# Подключиться к серверу
ssh user@your-server-ip

# Установить Node.js и PostgreSQL
sudo apt update
sudo apt install nodejs npm postgresql

# Следовать шагам развертывания выше
```

## Docker развертывание

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/equipment_monitoring
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=equipment_monitoring
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_backup.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

## Важные моменты

1. **Безопасность**: Обязательно измените SESSION_SECRET и пароли базы данных
2. **HTTPS**: Настройте SSL-сертификаты для продакшена
3. **Мониторинг**: Добавьте логирование и мониторинг ошибок
4. **Резервные копии**: Настройте автоматическое создание резервных копий БД
5. **Переменные окружения**: Никогда не коммитьте файлы с секретными данными

## Контрольный список развертывания
- [ ] Архив исходного кода создан
- [ ] Дамп базы данных экспортирован
- [ ] Переменные окружения настроены
- [ ] База данных восстановлена
- [ ] Зависимости установлены
- [ ] Проект собран и запущен
- [ ] Функциональность протестирована