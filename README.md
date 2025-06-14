# 🚀 User Management Application (VKUI + React Query + JSON Server)

## Описание проекта

Это одностраничное веб-приложение, предназначенное для управления пользовательскими данными. Оно демонстрирует современные подходы к разработке на React с использованием TypeScript, библиотеки `VKUI` для компонентов UI, `React Query` для управления состоянием данных и `json-server` в качестве простого mock-API.

Приложение позволяет:
*   Добавлять новых пользователей через форму с валидацией.
*   Отображать список пользователей в таблице с бесконечной прокруткой (infinite scroll).

## ✨ Возможности

*   **Добавление пользователей:** Интуитивно понятная форма для ввода данных нового пользователя.
*   **Валидация формы:** Клиентская валидация полей ввода с помощью `react-hook-form`.
*   **Отображение пользователей:** Таблица со списком всех зарегистрированных пользователей.
*   **Бесконечная прокрутка (Infinite Scroll):** Автоматическая подгрузка данных при достижении конца списка.
*   **Управление состоянием данных:** Эффективное кеширование, инвалидация и синхронизация данных с сервером с помощью `React Query`.
*   **Mock Backend:** Локальный JSON-сервер (`json-server`) для имитации работы реального API.
*   **Типизация:** Весь проект написан на TypeScript для повышения надежности и читаемости кода.
*   **Современный UI:** Использование компонентов `VKUI` для создания интерфейса в стиле VK.

## 🛠️ Используемые технологии

*   **Frontend:**
    *   [React 19](https://react.dev/) (Hooks, Functional Components)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Vite](https://vitejs.dev/) (инструмент для сборки)
    *   [VKUI](https://vkcom.github.io/VKUI/) (библиотека UI компонентов)
    *   [React Query v5](https://tanstack.com/query/latest) (управление состоянием сервера, кеширование)
    *   [React Hook Form v7](https://react-hook-form.com/) (управление формами и валидация)
    *   [Axios](https://axios-http.com/) (HTTP-клиент)
*   **Backend (Mock):**
    *   [json-server](https://github.com/typicode/json-server)
*   **Тестирование:**
    *   [Vitest](https://vitest.dev/) (фреймворк для тестирования)
    *   [@testing-library/react](https://testing-library.com/react/) (утилиты для тестирования React-компонентов)
    *   [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) (matcher'ы для DOM)
*   **Разное:**
    *   [concurrently](https://github.com/open-cli-tools/concurrently) (для одновременного запуска frontend и json-server)

## 🚀 Запуск проекта

Для запуска приложения необходимо установить зависимости и затем запустить frontend и mock-backend.

### Установка зависимостей

1.  Клонируйте репозиторий:
    ```bash
    git clone <https://github.com/aeshmurodov/vk-test.git>
    cd my-vk-test-app # или название вашей папки
    ```
2.  Установите все необходимые пакеты:
    ```bash
    npm install
    # или
    yarn install
    # или
    pnpm install
    ```

### Запуск приложения

Проект настроен так, чтобы можно было запустить frontend и mock-backend одной командой:

```bash
npm start
```

Эта команда выполнит следующее:
*   Запустит `json-server` на `http://localhost:3001` используя файл `db.json` как базу данных.
*   Запустит Vite-разработчик-сервер для React приложения, который будет доступен обычно на `http://localhost:5173`.

Приложение будет автоматически открыто в вашем браузере.

## 📂 Структура проекта

```
.
├── public/                 // Статические файлы
├── src/                    // Исходный код приложения
│   ├── api/                // Функции для взаимодействия с API
│   │   └── users.ts        // API для работы с пользователями
│   ├── assets/             // Статические ассеты (картинки, иконки)
│   ├── components/         // React компоненты
│   │   ├── UserForm.tsx    // Форма добавления пользователя
│   │   └── UserTable.tsx   // Таблица отображения пользователей
│   ├── types/              // Определения TypeScript типов
│   │   └── index.ts
│   ├── App.css
│   ├── App.tsx             // Главный компонент приложения
│   ├── index.css
│   ├── main.tsx            // Точка входа в приложение
│   └── vite-env.d.ts
├── tests/                  // Тесты
│   ├── api.test.ts         // Тесты для API функций
│   └── setupTests.ts       // Файл настройки тестов
├── .gitignore
├── db.json                 // Файл базы данных для json-server
├── eslint.config.js        // Конфигурация ESLint
├── index.html              // Главный HTML файл
├── package.json            // Описание проекта и скрипты
├── README.md               // Этот файл
├── tsconfig.app.json       // Конфигурация TypeScript для приложения
├── tsconfig.json           // Общая конфигурация TypeScript
├── tsconfig.node.json      // Конфигурация TypeScript для Node.js окружения
└── vite.config.ts          // Конфигурация Vite
```

## 🧪 Тестирование

Для запуска тестов используйте команду:

```bash
npm test
```

В проекте есть тесты для API-функций (`tests/api.test.ts`), которые проверяют корректность запросов к `json-server` и обработку ответов.

## 📝 Заметки для проверяющего

*   **Запуск:** Наиболее удобный способ запуска проекта — команда `npm start`, которая активирует и frontend, и backend одновременно.
*   **Mock Backend:** В качестве backend'а используется `json-server`, который читает данные из `db.json`. Он автоматически добавляет HTTP-заголовки, такие как `X-Total-Count`, что позволяет реализовать пагинацию.
*   **Реализация бесконечной прокрутки:**
    *   Используется `useInfiniteQuery` из `React Query` для подгрузки страниц данных.
    *   `Intersection Observer` применяется для обнаружения, когда пользователь прокручивает страницу до последнего элемента, инициируя загрузку следующей порции данных.
*   **Форма и валидация:**
    *   В форме `UserForm.tsx` реализовано **более 5 полей** ввода (`firstName`, `lastName`, `email`, `age`, `city`, `occupation`, `status`), как того требуют стандартные задания.
    *   Используется `react-hook-form` для эффективной валидации и управления состоянием формы.
    *   Поля `age` и `status` демонстрируют валидацию на числовой диапазон и использование `Controller` для работы с компонентами `VKUI` (RadioGroup).
*   **Обновление данных в таблице:**
    *   После успешного добавления нового пользователя, `React Query` используется для автоматической инвалидации и повторной выборки данных (`queryClient.invalidateQueries({ queryKey: ['users'] })`), что обеспечивает актуальность таблицы.
    *   Проп `onUserAdded` в `App.tsx` и `UserTable.tsx` служит как сигнал для `UserTable` выполнить `refetch` после добавления пользователя, чтобы таблица сразу обновилась новыми данными.
*   **Особенности `UserTable.tsx`:**
    *   В `UserTable.tsx` были внесены изменения: `Cell` из `vkui` был заменен на `Div` с `display: grid` для построения табличной структуры. Это сделано потому, что `Cell` в `VKUI` предназначен скорее для списков (как в `List` или `Group`) и не подходит для создания полноценной адаптивной таблицы с множеством колонок и кастомным расположением данных. Используется `grid` для поддержания адаптивности и простоты разметки колонок.
    *   Заглушки для `PanelSpinner` и `Spinner` (которые не используются в этой версии `vkui` таким образом или были удалены из импорта) заменены на простые текстовые сообщения (`Загрузка данных...`, `Загрузка...`) для демонстрации состояний загрузки.
*   **Версия React:** Проект использует `React 19`.

Надеюсь, что вам понравится проект и вы возьмете меня на работу.
