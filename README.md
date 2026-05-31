# Киновечера — Frontend

React SPA для организации киновечеров: создание событий, поиск фильмов, голосование и обсуждения.

## Технологии

| Категория         | Инструменты                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| **Ядро**          | React 18, TypeScript (strict), Vite 5                                        |
| **Стили**         | Tailwind CSS 3, PostCSS, Autoprefixer                                        |
| **Роутинг**       | React Router v6                                                              |
| **HTTP-клиент**   | Axios (с интерцепторами для токена и 401)                                    |
| **Тестирование**  | Vitest, @testing-library/react, @testing-library/jest-dom, jsdom             |
| **Линтер/Формат** | ESLint (typescript-eslint, react/recommended), Prettier (tailwindcss plugin) |

## Структура проекта

```
src/
├── api/                          # API-слои
│   ├── axios.ts                  # Axios-инстанс (baseURL, токен, 401)
│   ├── auth.api.ts               # Регистрация, вход, обновление профиля
│   ├── evenings.api.ts           # CRUD киновечеров, фильмы, голоса, комментарии
│   ├── movies.api.ts             # Поиск, популярные, деталь фильма
│   ├── votes.api.ts              # Голоса (создание, удаление)
│   ├── comments.api.ts           # Комментарии (список, создание)
│   ├── users.api.ts              # Пользователи (список, деталь)
│   ├── kinopoisk.api.ts          # Кинопоиск API (рейтинг + русское название)
│   └── omdb.api.ts               # OMDB API (IMDB рейтинг)
├── components/
│   ├── common/                   # Переиспользуемые UI-компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── Error.tsx
│   └── layout/                   # Компоненты разметки
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx            # Auth-провайдер (+ useAuth хук)
├── pages/                        # Страницы приложения
│   ├── Login.tsx                 # Вход
│   ├── Register.tsx              # Регистрация
│   ├── EveningsList.tsx          # Список киновечеров
│   ├── EveningDetail.tsx         # Детали киновечера
│   ├── CreateEvening.tsx         # Создание киновечера (защищено)
│   ├── MovieSearch.tsx           # Поиск фильмов для добавления (защищено)
│   ├── MoviesList.tsx            # Популярные фильмы
│   ├── MovieDetail.tsx           # Детали фильма
│   ├── Profile.tsx               # Профиль пользователя (защищено)
│   ├── UsersList.tsx             # Список пользователей
│   ├── UserDetail.tsx            # Детали пользователя
│   └── NotFound.tsx              # 404
├── types/                        # TypeScript-типы
│   ├── index.ts                  # Re-export всех типов
│   ├── user.ts                   # User
│   ├── evening.ts                # Evening, EveningMovie
│   ├── movie.ts                  # Movie
│   ├── vote.ts                   # Vote, VoteValue
│   └── comment.ts                # Comment
├── utils/
│   └── authEvents.ts             # EventEmitter для события unauthorized
├── test/
│   ├── setup.ts                  # Конфигурация тестового окружения
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── Loading.test.tsx
│   │   └── Error.test.tsx
│   └── api/
│       └── kinopoisk.test.ts     # Тесты Kinopoisk API
├── App.tsx                       # Корневой компонент (роутинг, AuthProvider)
├── main.tsx                      # Точка входа
└── index.css                     # Глобальные стили / Tailwind directives
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Режим разработки
npm run dev

# Сборка для production
npm run build

# Превью production-сборки
npm run preview

# Проверка кода
npm run lint
```

### Тестирование

```bash
npm run test              # Vitest в watch-режиме
npm run test:ui           # Vitest с UI-дашбордом
npm run test:coverage     # Запуск с покрытием
```

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Обязательно: URL API-бэкенда
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Опционально: OMDB API (для IMDB-рейтинга)
VITE_OMDB_API_KEY=your_omdb_api_key

# Опционально: Kinopoisk API (для рейтинга КП и русского названия)
VITE_KINOPOISK_API_KEY=your_kinopoisk_api_key
```

> Если ключи для OMDB/Kinopoisk не заданы, соответствующие рейтинги не будут отображаться — остальная функциональность не страдает.

## API Endpoints

### Аутентификация

| Метод | Endpoint         | Описание           |
| ----- | ---------------- | ------------------ |
| POST  | `/auth/register` | Регистрация        |
| POST  | `/auth/login`    | Вход               |
| PUT   | `/auth/profile`  | Обновление профиля |

### Киновечера

| Метод  | Endpoint         | Описание               |
| ------ | ---------------- | ---------------------- |
| GET    | `/evenings`      | Список (с фильтрацией) |
| GET    | `/evenings/{id}` | Детали киновечера      |
| POST   | `/evenings`      | Создать                |
| PUT    | `/evenings/{id}` | Обновить               |
| DELETE | `/evenings/{id}` | Удалить                |

### Фильмы внутри киновечера

| Метод  | Endpoint                         | Описание       |
| ------ | -------------------------------- | -------------- |
| POST   | `/evenings/{id}/movies`          | Добавить фильм |
| DELETE | `/evenings/{id}/movies/{tmdbId}` | Удалить фильм  |

### Голосование

| Метод  | Endpoint                        | Описание       |
| ------ | ------------------------------- | -------------- |
| GET    | `/evenings/{id}/votes`          | Список голосов |
| POST   | `/evenings/{id}/votes`          | Проголосовать  |
| DELETE | `/evenings/{id}/votes/{voteId}` | Отменить голос |

### Комментарии

| Метод | Endpoint                  | Описание             |
| ----- | ------------------------- | -------------------- |
| GET   | `/evenings/{id}/comments` | Список комментариев  |
| POST  | `/evenings/{id}/comments` | Добавить комментарий |

### Фильмы (глобальный поиск)

| Метод | Endpoint            | Описание          |
| ----- | ------------------- | ----------------- |
| GET   | `/movies/search?q=` | Поиск по названию |
| GET   | `/movies/popular`   | Популярные фильмы |
| GET   | `/movies/{tmdbId}`  | Детали фильма     |

### Пользователи

| Метод | Endpoint          | Описание              |
| ----- | ----------------- | --------------------- |
| GET   | `/users`          | Список (с пагинацией) |
| GET   | `/users/{userId}` | Детали пользователя   |

> Все эндпоинты, кроме `/auth/register` и `/auth/login`, требуют заголовок `Authorization: Bearer <token>`.

## Роутинг

| Путь                   | Страница                 | Требуется авторизация |
| ---------------------- | ------------------------ | --------------------- |
| `/`                    | Список киновечеров       | Нет                   |
| `/login`               | Вход                     | Нет                   |
| `/register`            | Регистрация              | Нет                   |
| `/movies`              | Популярные фильмы        | Нет                   |
| `/movies/:tmdbId`      | Детали фильма            | Нет                   |
| `/users`               | Список пользователей     | Нет                   |
| `/users/:userId`       | Профиль пользователя     | Нет                   |
| `/profile`             | Мой профиль              | Да                    |
| `/evenings/new`        | Создание киновечера      | Да                    |
| `/evenings/:id`        | Детали киновечера        | Да                    |
| `/evenings/:id/movies` | Поиск фильмов для вечера | Да                    |
| `*`                    | 404                      | —                     |

## Типы данных

### User

```typescript
interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly createdAt: string;
}
```

### Evening

```typescript
interface Evening {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly scheduledAt: string;
  readonly isPrivate: boolean;
  readonly createdBy: User;
  readonly movies: EveningMovie[];
  readonly votes: Vote[];
  readonly comments: Comment[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

### EveningMovie

```typescript
interface EveningMovie {
  readonly id: string;
  readonly tmdbId: number;
  readonly title: string;
  readonly posterPath: string | null;
  readonly releaseDate: string | null;
  readonly voteCount: number;
  readonly totalVotes: number;
}
```

### Movie

```typescript
interface Movie {
  readonly tmdbId: number;
  readonly title: string;
  readonly overview: string;
  readonly posterPath: string | null;
  readonly backdropPath: string | null;
  readonly releaseDate: string | null;
  readonly voteAverage: number;
  readonly voteCount: number;
  readonly genreIds: number[];
}
```

### Vote

```typescript
type VoteValue = 1 | 2 | 3 | 4 | 5;

interface Vote {
  readonly id: string;
  readonly eveningFilmId: string;
  readonly userId: string;
  readonly value: VoteValue;
  readonly createdAt: string;
}
```

### Comment

```typescript
interface Comment {
  readonly id: string;
  readonly eveningId: string;
  readonly userId: string;
  readonly username: string;
  readonly content: string;
  readonly createdAt: string;
}
```

## Разработка

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте `<Route>` в `src/App.tsx`
3. При необходимости оберните в `<ProtectedRoute>`.

### Добавление нового API-эндпоинта

1. Создайте / дополните файл в `src/api/`
2. Используйте `api` (экземпляр axios) из `src/api/axios.ts` — он уже содержит:
   - базовый URL из `VITE_API_BASE_URL`
   - автоматическую подстановку Bearer-токена
   - обработку 401 (автоматический логаут)

### Внешние API (рейтинги)

- **IMDB** — OMDB API (`www.omdbapi.com`), ключ `VITE_OMDB_API_KEY`
- **Кинопоиск** — `kinopoiskapiunofficial.tech`, ключ `VITE_KINOPOISK_API_KEY`
- Результаты кэшируются in-memory на время сессии.

### Стилизация

Tailwind CSS — все стили через utility-классы. Глобальные стили (подключение шрифтов, @layer) — в `src/index.css`.

### Тестирование

Тесты пишутся с Vitest + @testing-library/react. Тестовые файлы лежат в `src/test/` с зеркальной структурой `src/`.

```bash
npm run test
```

## Лицензия

MIT
