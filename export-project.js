#!/usr/bin/env node

/**
 * Автоматический экспортер проекта системы мониторинга оборудования
 * Создает готовый к развертыванию пакет проекта
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Запуск экспорта проекта...\n');

// Функция для создания папки если она не существует
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Функция для копирования файлов
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ Скопирован: ${src}`);
  } catch (error) {
    console.log(`❌ Ошибка копирования ${src}: ${error.message}`);
  }
}

// Функция для копирования папки рекурсивно
function copyDir(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Создание папки для экспорта
const exportDir = 'equipment-monitoring-export';
const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const fullExportDir = `${exportDir}-${timestamp}`;

console.log(`📁 Создание папки экспорта: ${fullExportDir}`);
ensureDir(fullExportDir);

// Список файлов и папок для копирования
const itemsToCopy = [
  // Основные папки
  { src: 'client', dest: path.join(fullExportDir, 'client'), type: 'dir' },
  { src: 'server', dest: path.join(fullExportDir, 'server'), type: 'dir' },
  { src: 'shared', dest: path.join(fullExportDir, 'shared'), type: 'dir' },
  
  // Конфигурационные файлы
  { src: 'package.json', dest: path.join(fullExportDir, 'package.json'), type: 'file' },
  { src: 'package-lock.json', dest: path.join(fullExportDir, 'package-lock.json'), type: 'file' },
  { src: 'tsconfig.json', dest: path.join(fullExportDir, 'tsconfig.json'), type: 'file' },
  { src: 'vite.config.ts', dest: path.join(fullExportDir, 'vite.config.ts'), type: 'file' },
  { src: 'tailwind.config.ts', dest: path.join(fullExportDir, 'tailwind.config.ts'), type: 'file' },
  { src: 'postcss.config.js', dest: path.join(fullExportDir, 'postcss.config.js'), type: 'file' },
  { src: 'components.json', dest: path.join(fullExportDir, 'components.json'), type: 'file' },
  { src: 'drizzle.config.ts', dest: path.join(fullExportDir, 'drizzle.config.ts'), type: 'file' },
  
  // Документация
  { src: 'DEPLOYMENT_GUIDE.md', dest: path.join(fullExportDir, 'DEPLOYMENT_GUIDE.md'), type: 'file' },
  { src: 'BEGINNER_DEPLOYMENT_GUIDE.md', dest: path.join(fullExportDir, 'BEGINNER_DEPLOYMENT_GUIDE.md'), type: 'file' },
  { src: 'FREE_HOSTING_GUIDE.md', dest: path.join(fullExportDir, 'FREE_HOSTING_GUIDE.md'), type: 'file' },
];

// Копирование файлов и папок
console.log('\n📋 Копирование файлов проекта...');
for (const item of itemsToCopy) {
  if (fs.existsSync(item.src)) {
    if (item.type === 'dir') {
      console.log(`📁 Копирование папки: ${item.src}`);
      copyDir(item.src, item.dest);
    } else {
      copyFile(item.src, item.dest);
    }
  } else {
    console.log(`⚠️  Файл не найден: ${item.src}`);
  }
}

// Создание .env.example
console.log('\n⚙️  Создание файла .env.example...');
const envExample = `# Настройки базы данных
DATABASE_URL=postgresql://postgres:password@localhost:5432/equipment_monitoring
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password_here
PGDATABASE=equipment_monitoring

# Настройки приложения
NODE_ENV=development
PORT=5000
SESSION_SECRET=change-this-to-a-random-string

# Для продакшена замените на ваши значения
# NODE_ENV=production
# DATABASE_URL=ваш_реальный_database_url
# SESSION_SECRET=очень_длинный_случайный_ключ`;

fs.writeFileSync(path.join(fullExportDir, '.env.example'), envExample);
console.log('✅ Создан .env.example');

// Создание README.md для экспорта
console.log('\n📄 Создание README.md...');
const readmeContent = `# Система мониторинга оборудования

## Быстрый старт

1. **Установите зависимости:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Настройте базу данных:**
   - Установите PostgreSQL
   - Создайте базу данных \`equipment_monitoring\`
   - Скопируйте \`.env.example\` в \`.env\`
   - Заполните настройки подключения к базе данных

3. **Восстановите данные (если есть дамп):**
   \`\`\`bash
   psql -U postgres -d equipment_monitoring < database_backup.sql
   \`\`\`

4. **Запустите приложение:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Откройте в браузере:**
   http://localhost:5000

## Развертывание

Подробные инструкции смотрите в:
- \`BEGINNER_DEPLOYMENT_GUIDE.md\` - для новичков
- \`FREE_HOSTING_GUIDE.md\` - бесплатные хостинги
- \`DEPLOYMENT_GUIDE.md\` - продвинутое развертывание

## Технологии

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **База данных:** PostgreSQL
- **ORM:** Drizzle ORM

## Функции

- Управление оборудованием
- Планирование и отслеживание технического обслуживания
- Ежедневные осмотры оборудования
- Система задач и уведомлений
- Отчеты и аналитика
- Многопользовательский доступ

## Поддержка

Система полностью самодостаточна и может работать на любом сервере с Node.js и PostgreSQL.

Дата экспорта: ${new Date().toLocaleString('ru-RU')}
`;

fs.writeFileSync(path.join(fullExportDir, 'README.md'), readmeContent);
console.log('✅ Создан README.md');

// Создание скрипта установки для Windows
console.log('\n🔧 Создание скриптов установки...');
const windowsInstallScript = `@echo off
echo Установка системы мониторинга оборудования
echo.

echo Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Node.js не установлен!
    echo Скачайте с https://nodejs.org/
    pause
    exit /b 1
)

echo Проверка PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: PostgreSQL не установлен!
    echo Скачайте с https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo Установка зависимостей...
npm install

echo.
echo Проверьте файл .env.example и создайте .env с вашими настройками
echo Затем запустите: npm run dev
echo.
pause`;

fs.writeFileSync(path.join(fullExportDir, 'install.bat'), windowsInstallScript);
console.log('✅ Создан install.bat для Windows');

// Создание скрипта установки для Linux/macOS
const unixInstallScript = `#!/bin/bash

echo "Установка системы мониторинга оборудования"
echo

echo "Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "ОШИБКА: Node.js не установлен!"
    echo "Установите с https://nodejs.org/"
    exit 1
fi

echo "Проверка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "ОШИБКА: PostgreSQL не установлен!"
    echo "Установите PostgreSQL для вашей ОС"
    exit 1
fi

echo "Установка зависимостей..."
npm install

echo
echo "Проверьте файл .env.example и создайте .env с вашими настройками"
echo "Затем запустите: npm run dev"
echo`;

fs.writeFileSync(path.join(fullExportDir, 'install.sh'), unixInstallScript);
console.log('✅ Создан install.sh для Linux/macOS');

// Попытка экспорта базы данных (если доступна)
console.log('\n💾 Попытка экспорта базы данных...');
try {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log('Найден DATABASE_URL, создание дампа...');
    execSync(`pg_dump "${dbUrl}" > "${path.join(fullExportDir, 'database_backup.sql')}"`, 
      { stdio: 'inherit' });
    console.log('✅ База данных экспортирована в database_backup.sql');
  } else {
    console.log('⚠️  DATABASE_URL не найден, создание примера дампа...');
    const sampleDump = `-- Пример дампа базы данных
-- Выполните реальный экспорт командой:
-- pg_dump "your_database_url" > database_backup.sql

-- Этот файл можно удалить после создания реального дампа`;
    fs.writeFileSync(path.join(fullExportDir, 'database_backup_example.sql'), sampleDump);
    console.log('✅ Создан database_backup_example.sql');
  }
} catch (error) {
  console.log(`⚠️  Не удалось экспортировать БД: ${error.message}`);
  console.log('   Выполните экспорт вручную: pg_dump "DATABASE_URL" > database_backup.sql');
}

// Создание архива (если доступен tar)
console.log('\n📦 Создание архива...');
try {
  execSync(`tar -czf ${fullExportDir}.tar.gz ${fullExportDir}`, { stdio: 'inherit' });
  console.log(`✅ Создан архив: ${fullExportDir}.tar.gz`);
} catch (error) {
  console.log('⚠️  tar не доступен, архив не создан');
  console.log('   Архив можно создать вручную или использовать WinRAR/7-Zip');
}

// Заключительные инструкции
console.log(`
🎉 Экспорт завершен!

📁 Папка проекта: ${fullExportDir}
📦 Архив: ${fullExportDir}.tar.gz (если создан)

📋 Что дальше:
1. Скопируйте папку ${fullExportDir} на целевой сервер
2. Следуйте инструкциям в BEGINNER_DEPLOYMENT_GUIDE.md
3. Для Windows запустите install.bat
4. Для Linux/macOS запустите: chmod +x install.sh && ./install.sh

🌐 Рекомендуемые бесплатные хостинги:
- Railway.app (самый простой)
- Render.com (надежный)
- Vercel.com + Supabase (быстрый)

📚 Документация включена:
- README.md - краткое описание
- BEGINNER_DEPLOYMENT_GUIDE.md - пошаговые инструкции
- FREE_HOSTING_GUIDE.md - бесплатные хостинги
- DEPLOYMENT_GUIDE.md - продвинутое развертывание

Удачи с развертыванием! 🚀
`);

process.exit(0);