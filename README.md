# URL Checker

Fullstack-приложение для асинхронной проверки списка URL через `HEAD`-запросы.

## Стек

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite, Zustand
- Хранение: in-memory
- Docker: `Dockerfile` для backend/frontend и `docker-compose.yml`

## Возможности

- Создание задания из списка URL: `POST /api/jobs`
- Фоновая обработка URL с ограничением 5 одновременных `HEAD`-запросов на задание
- Искусственная задержка 0-10 секунд перед сохранением результата
- Список заданий: `GET /api/jobs`
- Детали задания: `GET /api/jobs/:id`
- Отмена задания: `DELETE /api/jobs/:id`
- Frontend с polling активного задания и защитой от устаревших ответов

## Локальный запуск

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

## Скрипты

```bash
npm run build
npm run typecheck
npm run lint
npm run test
```

## API

### `GET /api`

Возвращает краткую информацию об API и доступных endpoints.

### `POST /api/jobs`

```json
{
  "urls": ["https://example.com"]
}
```

Ответ:

```json
{
  "jobId": "..."
}
```

### `GET /api/jobs`

Возвращает краткую информацию по последним заданиям.

### `GET /api/jobs/:id`

Возвращает детальную информацию по заданию и каждому URL.

### `DELETE /api/jobs/:id`

Отменяет задание. Уже начатые HTTP-запросы не прерываются принудительно, но не начатые URL помечаются как `cancelled`.
