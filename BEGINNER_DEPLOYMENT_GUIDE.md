# Пошаговое руководство по копированию проекта для новичков

## Часть 1: Подготовка к копированию

### Шаг 1: Что вам понадобится
- Компьютер с Windows, macOS или Linux
- Интернет-соединение
- Базовые навыки работы с командной строкой

### Шаг 2: Скачивание необходимых программ

#### 2.1 Установка Node.js
1. Перейдите на сайт https://nodejs.org/
2. Скачайте LTS версию (рекомендуемая)
3. Запустите установщик и следуйте инструкциям
4. Проверьте установку:
   - Откройте командную строку (Windows: cmd, macOS/Linux: Terminal)
   - Введите: `node --version`
   - Должна появиться версия Node.js

#### 2.2 Установка Git (для копирования кода)
1. Перейдите на сайт https://git-scm.com/
2. Скачайте версию для вашей операционной системы
3. Установите с настройками по умолчанию
4. Проверьте: `git --version`

#### 2.3 Установка PostgreSQL (база данных)
1. Перейдите на https://www.postgresql.org/download/
2. Выберите вашу операционную систему
3. Скачайте и установите PostgreSQL
4. **ВАЖНО**: Запомните пароль для пользователя postgres!

## Часть 2: Копирование проекта с Replit

### Способ 1: Скачивание ZIP-архива

#### Шаг 1: Экспорт из Replit
1. Откройте ваш проект в Replit
2. Нажмите на три точки (...) в файловом менеджере
3. Выберите "Download as ZIP"
4. Сохраните архив на ваш компьютер
5. Распакуйте архив в удобную папку

### Способ 2: Клонирование через Git

#### Шаг 1: Получение Git-ссылки
1. В Replit откройте меню Version Control (Git)
2. Найдите и скопируйте Git URL вашего репозитория

#### Шаг 2: Клонирование проекта
1. Откройте командную строку
2. Перейдите в папку, где хотите разместить проект:
   ```bash
   cd C:\Projects  # Windows
   cd ~/Projects   # macOS/Linux
   ```
3. Клонируйте проект:
   ```bash
   git clone [ваша-git-ссылка]
   cd [название-папки-проекта]
   ```

## Часть 3: Экспорт базы данных

### Шаг 1: Получение данных PostgreSQL из Replit
1. В Replit откройте вкладку Secrets (Environment variables)
2. Найдите и скопируйте:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### Шаг 2: Создание дампа базы данных
1. Откройте командную строку
2. Используйте команду для создания дампа:
   ```bash
   # Замените значения на ваши из Replit
   pg_dump -h [PGHOST] -p [PGPORT] -U [PGUSER] -d [PGDATABASE] > database_backup.sql
   ```
3. Введите пароль `PGPASSWORD` когда система запросит

## Часть 4: Установка на вашем компьютере

### Шаг 1: Подготовка папки проекта
1. Откройте командную строку
2. Перейдите в папку с проектом:
   ```bash
   cd путь/к/вашему/проекту
   ```

### Шаг 2: Установка зависимостей
```bash
npm install
```
Эта команда автоматически скачает все необходимые библиотеки.

### Шаг 3: Создание локальной базы данных

#### 3.1 Создание новой базы данных
1. Найдите программу pgAdmin (устанавливается с PostgreSQL)
2. Запустите pgAdmin
3. Подключитесь к серверу PostgreSQL (пароль тот, что вы установили)
4. Правой кнопкой на "Databases" → "Create" → "Database"
5. Назовите базу данных: `equipment_monitoring`

#### 3.2 Восстановление данных
1. В командной строке выполните:
   ```bash
   psql -U postgres -d equipment_monitoring < database_backup.sql
   ```
2. Введите пароль postgres

### Шаг 4: Настройка переменных окружения

#### 4.1 Создание файла .env
1. В папке проекта создайте файл `.env` (точка в начале обязательна!)
2. Откройте файл в любом текстовом редакторе
3. Добавьте следующие строки, заменив значения на ваши:

```env
# Настройки базы данных
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/equipment_monitoring
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=ваш_пароль_postgres
PGDATABASE=equipment_monitoring

# Настройки приложения
NODE_ENV=development
PORT=5000
SESSION_SECRET=any-random-string-here
```

### Шаг 5: Запуск проекта
```bash
npm run dev
```

### Шаг 6: Проверка работы
1. Откройте браузер
2. Перейдите по адресу: http://localhost:5000
3. Должна открыться страница входа в систему

## Часть 5: Развертывание на бесплатных хостингах

### Вариант 1: Railway (рекомендуется)

#### Шаг 1: Регистрация
1. Перейдите на https://railway.app/
2. Зарегистрируйтесь через GitHub

#### Шаг 2: Загрузка проекта
1. Создайте репозиторий на GitHub с вашим кодом
2. В Railway нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий

#### Шаг 3: Добавление базы данных
1. В проекте Railway нажмите "Add Service"
2. Выберите "PostgreSQL"
3. База данных создастся автоматически

#### Шаг 4: Настройка переменных
1. Перейдите в настройки вашего приложения
2. Добавьте переменные окружения:
   - `NODE_ENV=production`
   - `SESSION_SECRET=ваш-секретный-ключ`
3. DATABASE_URL добавится автоматически

#### Шаг 5: Восстановление данных
1. Получите DATABASE_URL из Railway
2. Выполните команду для восстановления:
   ```bash
   psql [DATABASE_URL] < database_backup.sql
   ```

### Вариант 2: Render

#### Шаг 1: Подготовка
1. Регистрация на https://render.com/
2. Загрузка кода на GitHub

#### Шаг 2: Создание сервисов
1. Создайте PostgreSQL базу данных
2. Создайте Web Service для приложения
3. Укажите команду запуска: `npm start`

#### Шаг 3: Настройка переменных окружения
Добавьте все переменные из файла .env

## Часть 6: Устранение типичных проблем

### Проблема: "Cannot find module"
**Решение**: Выполните `npm install` в папке проекта

### Проблема: "ECONNREFUSED" при подключении к базе данных
**Решение**: 
1. Проверьте, запущен ли PostgreSQL
2. Проверьте правильность данных в .env файле

### Проблема: "Permission denied"
**Решение**: Убедитесь, что у пользователя postgres есть права на создание таблиц

### Проблема: Страница не открывается
**Решение**:
1. Проверьте, что приложение запущено без ошибок
2. Убедитесь, что порт 5000 не занят другим приложением

## Часть 7: Полезные команды

```bash
# Просмотр логов приложения
npm run dev

# Остановка приложения
Ctrl+C (в командной строке)

# Проверка статуса PostgreSQL
# Windows:
net start postgresql-x64-14

# macOS/Linux:
brew services start postgresql
# или
sudo systemctl start postgresql

# Подключение к базе данных для проверки
psql -U postgres -d equipment_monitoring
```

## Часть 8: Контрольный список

### Перед развертыванием убедитесь:
- [ ] Node.js установлен и работает
- [ ] PostgreSQL установлен и запущен
- [ ] Код проекта скачан
- [ ] Зависимости установлены (`npm install`)
- [ ] База данных создана
- [ ] Дамп базы данных восстановлен
- [ ] Файл .env создан и настроен
- [ ] Приложение запускается без ошибок
- [ ] Веб-интерфейс открывается в браузере

### Если что-то не работает:
1. Прочитайте сообщения об ошибках внимательно
2. Проверьте все шаги еще раз
3. Убедитесь, что все пароли и настройки указаны правильно
4. Перезапустите приложение и базу данных

Этот проект теперь полностью независим и может работать на любом сервере или компьютере с Node.js и PostgreSQL!