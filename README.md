# Киновечера — Frontend

React SPA для организации киновечеров: создание событий, поиск фильмов, голосование и обсуждения.

## Технологии

| Категория              | Инструменты                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Ядро**               | React 18, TypeScript 5 (strict), Vite 5                                                                         |
| **Стили**              | Tailwind CSS 3 (кастомная тема), PostCSS, Autoprefixer                                                          |
| **Роутинг**            | React Router v6                                                                                                 |
| **HTTP-клиент**        | Axios (с интерцепторами для токена, 401 → logout, кастомный `ApiError`)                                         |
| **Тестирование**       | Vitest (v8 coverage, UI), jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event |
| **Линтер / Форматтер** | ESLint (typescript-eslint, react, react-hooks, react-refresh), Prettier (tailwindcss plugin)                    |
| **Git hooks**          | Husky, lint-staged (авто-линтер + форматтер при коммите)                                                        |

## Структура проекта

```
src/
├── api/                              # API-слой
│   ├── axios.ts                      # Axios-инстанс (baseURL, перехват 401, ApiError)
│   ├── auth.api.ts                   # Регистрация, вход, обновление профиля, logout
│   ├── evenings.api.ts               # CRUD киновечеров, фильмы, голоса, комментарии
│   ├── movies.api.ts                 # Поиск, популярные, деталь фильма
│   ├── votes.api.ts                  # Голоса (список, создание, удаление)
│   ├── comments.api.ts               # Комментарии (список, создание)
│   ├── users.api.ts                  # Пользователи (список, деталь)
│   ├── kinopoisk.api.ts              # Kinopoisk API (рейтинг КП, русское название, описание)
│   └── omdb.api.ts                   # OMDB API (IMDB рейтинг)
├── components/
│   ├── common/                       # Переиспользуемые UI-компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── Error.tsx
│   ├── evenings/                     # Компоненты для киновечеров
│   └── layout/                       # Компоненты разметки
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx               # Auth-провайдер (+ useAuth хук, login/register/logout/updateProfile)
├── hooks/                            # Кастомные React-хуки
│   ├── useAsyncAction.ts             # Асинхронные действия с состояниями isLoading/error/success
│   ├── useAuthRedirect.ts            # Редирект аутентифицированных пользователей
│   ├── useEveningPolling.ts          # Polling данных киновечера (каждые 8 с)
│   ├── useMovieRatings.ts            # Загрузка рейтингов IMDB + Кинопоиск
│   ├── usePaginatedFetch.ts          # Данные с пагинацией (с отменой при размонтировании)
│   ├── usePolling.ts                 # Базовый polling с Page Visibility API
│   ├── useUserEvenings.ts            # Список киновечеров текущего пользователя
│   └── useVote.ts                    # Голосование с optimistic update
├── pages/                            # Страницы приложения
│   ├── Login.tsx                     # Вход
│   ├── Register.tsx                  # Регистрация
│   ├── EveningsList.tsx              # Список киновечеров (все/публичные/мои)
│   ├── EveningDetail.tsx             # Детали киновечера (фильмы, голоса, комментарии)
│   ├── CreateEvening.tsx             # Создание киновечера (защищено)
│   ├── MovieSearch.tsx               # Поиск фильмов для добавления (защищено)
│   ├── MoviesList.tsx                # Популярные фильмы
│   ├── MovieDetail.tsx               # Детали фильма
│   ├── Profile.tsx                   # Профиль пользователя (защищено)
│   ├── UsersList.tsx                 # Список пользователей
│   ├── UserDetail.tsx                # Детали пользователя
│   └── NotFound.tsx                  # 404
├── types/                            # TypeScript-типы
│   ├── index.ts                      # Re-export всех типов
│   ├── user.ts                       # User
│   ├── evening.ts                    # Evening, EveningMovie
│   ├── movie.ts                      # Movie
│   ├── vote.ts                       # Vote, VoteValue
│   └── comment.ts                    # Comment
├── utils/
│   └── authEvents.ts                 # EventEmitter для события unauthorized
├── test/                             # Тесты (зеркальная структура src/)
│   ├── setup.ts                      # Конфигурация тестового окружения
│   ├── api/                          # Тесты API-слоя
│   ├── components/                   # Тесты компонентов (Button, Input, Card, Loading, Error, Header, Footer, Layout)
│   ├── contexts/                     # Тесты контекстов (AuthContext)
│   ├── hooks/                        # Тесты хуков
│   ├── pages/                        # Тесты страниц
│   └── utils/                        # Тесты утилит
├── App.tsx                           # Корневой компонент (BrowserRouter, AuthProvider, Routes, ProtectedRoute)
├── main.tsx                          # Точка входа (React.StrictMode)
├── index.css                         # Tailwind directives / глобальные стили
└── vite-env.d.ts                     # Тайпинги Vite env
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Режим разработки (порт 3000, прокси /api → https://otus-mp-backend.onrender.com)
npm run dev

# Проверка типов
npm run typecheck

# Линтинг
npm run lint

# Проверка форматирования
npm run lint:check

# Сборка для production
npm run build

# Превью production-сборки
npm run preview
```

### Тестирование

```bash
npm run test              # Vitest (однократный прогон)
npm run test:ui           # Vitest с UI-дашбордом
npm run test:coverage     # Запуск с покрытием (порог: statements 80%, branches 70%, functions 80%, lines 80%)
```

### Git hooks

```bash
# Установка Husky (выполняется автоматически после npm install)
npm run prepare
```

При коммите `lint-staged` автоматически запускает ESLint и Prettier для staged-файлов.

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```env
# URL API-бэкенда (по умолчанию https://otus-mp-backend.onrender.com/api/v1)
VITE_API_BASE_URL=https://otus-mp-backend.onrender.com/api/v1

# Опционально: OMDB API (для IMDB-рейтинга)
VITE_OMDB_API_KEY=your_omdb_api_key_here

# Опционально: Kinopoisk API (для рейтинга КП, русского названия и описания)
VITE_KINOPOISK_API_KEY=your_kinopoisk_api_key_here
```

> Если ключи OMDB / Kinopoisk не заданы, соответствующие рейтинги не отображаются — остальная функциональность работает без изменений.

### Vite Config

- **base**: `/otus-js-b-course-project/`
- **Порт dev-сервера**: `3000`
- **Прокси**: `/api` → `https://otus-mp-backend.onrender.com`
- **Alias**: `@` → `src/`

### Tailwind CSS

Кастомная тема включает:

- **Цвета**: `primary` (голубая шкала, 50–900) и `dark` (slate-шкала, 50–900)
- **Шрифт**: `Inter`, `system-ui`, `sans-serif`

Глобальные стили и подключение шрифтов — в `src/index.css`.

### TypeScript

Строгий режим (`strict: true`) с дополнительными проверками:

- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `exactOptionalPropertyTypes`
- Path alias: `@/*` → `src/*`

## API Endpoints

### Аутентификация

| Метод | Endpoint         | Описание           | Auth |
| ----- | ---------------- | ------------------ | ---- |
| POST  | `/auth/register` | Регистрация        | Нет  |
| POST  | `/auth/login`    | Вход               | Нет  |
| PUT   | `/auth/profile`  | Обновление профиля | Да   |

### Киновечера

| Метод  | Endpoint         | Описание                         | Auth |
| ------ | ---------------- | -------------------------------- | ---- |
| GET    | `/evenings`      | Список (с пагинацией и фильтром) | Да   |
| GET    | `/evenings/{id}` | Детали киновечера                | Да   |
| POST   | `/evenings`      | Создать                          | Да   |
| PUT    | `/evenings/{id}` | Обновить                         | Да   |
| DELETE | `/evenings/{id}` | Удалить                          | Да   |

**Параметры `GET /evenings`:**

| Параметр    | Тип    | Описание                                 |
| ----------- | ------ | ---------------------------------------- |
| `page`      | number | Номер страницы (по умолчанию 1)          |
| `limit`     | number | Элементов на странице (по умолчанию 10)  |
| `filter`    | string | `my` / `public` / `all`                  |
| `createdBy` | string | ID пользователя для фильтрации по автору |

### Фильмы внутри киновечера

| Метод  | Endpoint                         | Описание       | Auth |
| ------ | -------------------------------- | -------------- | ---- |
| POST   | `/evenings/{id}/movies`          | Добавить фильм | Да   |
| DELETE | `/evenings/{id}/movies/{tmdbId}` | Удалить фильм  | Да   |

### Голосование

| Метод  | Endpoint                        | Описание       | Auth |
| ------ | ------------------------------- | -------------- | ---- |
| GET    | `/evenings/{id}/votes`          | Список голосов | Да   |
| POST   | `/evenings/{id}/votes`          | Проголосовать  | Да   |
| DELETE | `/evenings/{id}/votes/{voteId}` | Отменить голос | Да   |

### Комментарии

| Метод | Endpoint                  | Описание             | Auth |
| ----- | ------------------------- | -------------------- | ---- |
| GET   | `/evenings/{id}/comments` | Список комментариев  | Да   |
| POST  | `/evenings/{id}/comments` | Добавить комментарий | Да   |

### Фильмы (глобальный поиск)

| Метод | Endpoint            | Описание          | Auth |
| ----- | ------------------- | ----------------- | ---- |
| GET   | `/movies/search?q=` | Поиск по названию | Да   |
| GET   | `/movies/popular`   | Популярные фильмы | Да   |
| GET   | `/movies/{tmdbId}`  | Детали фильма     | Да   |

### Пользователи

| Метод | Endpoint          | Описание              | Auth |
| ----- | ----------------- | --------------------- | ---- |
| GET   | `/users`          | Список (с пагинацией) | Да   |
| GET   | `/users/{userId}` | Детали пользователя   | Да   |

> Все эндпоинты, кроме `/auth/register` и `/auth/login`, требуют заголовок `Authorization: Bearer <token>`. При получении 401 происходит автоматический logout.

## Роутинг

| Путь                   | Страница                  | Требуется авторизация |
| ---------------------- | ------------------------- | --------------------- |
| `/`                    | Список киновечеров        | Нет                   |
| `/login`               | Вход                      | Нет                   |
| `/register`            | Регистрация               | Нет                   |
| `/movies`              | Популярные фильмы         | Нет                   |
| `/movies/:tmdbId`      | Детали фильма             | Нет                   |
| `/users`               | Список пользователей      | Нет                   |
| `/users/:userId`       | Детали пользователя       | Нет                   |
| `/profile`             | Мой профиль               | Да                    |
| `/evenings/new`        | Создание киновечера       | Да                    |
| `/evenings/:id`        | Детали киновечера         | Да                    |
| `/evenings/:id/movies` | Поиск фильмов для вечера  | Да                    |
| `*`                    | 404 (Страница не найдена) | —                     |

> Защита маршрутов реализована через компонент `ProtectedRoute` в [`App.tsx`](src/App.tsx:18). При отсутствии токена — редирект на `/login`.

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

### Пути (aliases)

В проекте настроен path alias `@` → `src/` как для Vite (разработка/сборка), так и для Vitest (тесты):

```typescript
import { api } from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
```

### Добавление новой страницы

1. Создайте компонент в [`src/pages/`](src/pages/)
2. Добавьте `<Route>` в [`src/App.tsx`](src/App.tsx)
3. При необходимости оберните в `<ProtectedRoute>`.

### Добавление нового API-эндпоинта

1. Создайте / дополните файл в [`src/api/`](src/api/)
2. Используйте `api` (экземпляр axios) из [`src/api/axios.ts`](src/api/axios.ts) — он уже содержит:
   - базовый URL из `VITE_API_BASE_URL`
   - автоматическую подстановку Bearer-токена
   - обработку 401 (автоматический logout через `authEvents`)
   - преобразование ошибок в `ApiError` с полями `status`, `code`, `fieldErrors`

### Хуки (Hooks)

Основные переиспользуемые хуки в [`src/hooks/`](src/hooks/):

| Хук                                                   | Назначение                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| [`useAsyncAction`](src/hooks/useAsyncAction.ts)       | Асинхронные действия с состояниями isLoading / error / success |
| [`useAuthRedirect`](src/hooks/useAuthRedirect.ts)     | Редирект аутентифицированного пользователя с логин/регистрации |
| [`useEveningPolling`](src/hooks/useEveningPolling.ts) | Polling данных киновечера (по умолчанию 8 с)                   |
| [`useMovieRatings`](src/hooks/useMovieRatings.ts)     | Загрузка рейтингов IMDB + Кинопоиск с кэшированием             |
| [`usePaginatedFetch`](src/hooks/usePaginatedFetch.ts) | Пагинированная загрузка данных (с отменой при unmount)         |
| [`usePolling`](src/hooks/usePolling.ts)               | Базовый polling с Page Visibility API и поддержкой blur/focus  |
| [`useUserEvenings`](src/hooks/useUserEvenings.ts)     | Загрузка киновечеров текущего пользователя                     |
| [`useVote`](src/hooks/useVote.ts)                     | Голосование с optimistic update                                |

### Внешние API (рейтинги)

- **IMDB** — OMDB API (`www.omdbapi.com`), ключ `VITE_OMDB_API_KEY`
- **Кинопоиск** — `kinopoiskapiunofficial.tech`, ключ `VITE_KINOPOISK_API_KEY`
- Результаты кэшируются in-memory на время сессии.
- Если ключ API не задан — соответствующий рейтинг не отображается без ошибок.

### Стилизация

Tailwind CSS — все стили через utility-классы. Кастомная тема (цвета primary/dark, шрифт Inter) — в [`tailwind.config.js`](tailwind.config.js). Глобальные стили — в [`src/index.css`](src/index.css).

### Тестирование

Тесты пишутся с Vitest + @testing-library/react + @testing-library/user-event. Тестовые файлы лежат в [`src/test/`](src/test/) с зеркальной структурой `src/`. Конфигурация — в [`vitest.config.ts`](vitest.config.ts).

- Пороги покрытия: statements 80%, branches 70%, functions 80%, lines 80%
- Покрытие измеряется per-file
- Из покрытия исключены: тесты, `main.tsx`, `vite-env.d.ts`, `types/`

```bash
npm run test
```

### Git hooks (Husky + lint-staged)

При коммите `lint-staged` автоматически выполняет:

- `*.{ts,tsx,cjs,js}`: ESLint (fix) + Prettier (write)
- `*.{json,css,md,yml}`: Prettier (write)

## Лицензия

MIT
