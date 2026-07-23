# theia-notifications

Система уведомлений для Eclipse Theia: всплывающие тосты, боковая панель с историей, персистентное хранение и RPC-коммуникация между frontend и backend.

## Функциональность

- **Тосты** — всплывающие уведомления в правом нижнем углу (info / warning / error)
  - Автозакрытие через 5 секунд для info и warning
  - Error остаётся до явного закрытия
  - Кнопки действий (actions) с отправкой события на backend
- **Боковая панель** — история уведомлений в правом сайдбаре (иконка 🔔)
  - Фильтрация по severity: All / Info / Warning / Error
  - Группировка по датам: Сегодня / Вчера / Ранее
  - Кнопка «Clear All» для очистки истории
  - Обновление в реальном времени при новых уведомлениях
- **Персистентность** — история сохраняется в `<workspace>/.theia-notifications/history.json` и восстанавливается после перезапуска
- **RPC** — двусторонняя коммуникация frontend ↔ backend через `RpcConnectionHandler`

## Требования

- **Node.js >= 22**
- **Yarn >= 1.7.0**

## Установка и сборка

```bash
# 1. Установить зависимости
yarn install

# 2. Скопировать конфигурацию esbuild для CSS Modules
#    (browser-app в .gitignore, поэтому файл хранится в корне)
cp replace.esbuild.mjs browser-app/esbuild.mjs

# 3. Собрать проект
yarn build:browser
```

## Запуск

```bash
yarn start:browser
```
Открыть в браузере: http://localhost:3000
##Тестирование
```bash
yarn test
```
## Архитектура
┌─────────────────────────────────────────────────────┐
│                   Frontend (Browser)                 │
│                                                     │
│  NotificationTestContribution (команды)              │
│         │                                           │
│         ▼                                           │
│  NotificationFrontendService (фасад)                 │
│    ├── NotificationClientImpl (приём событий)        │
│    └── RPC-прокси → NotificationService              │
│         │                                           │
│    ┌────┴────────────────┐                          │
│    ▼                     ▼                          │
│  ToastManager      PanelWidget (React)              │
│    │                     │                          │
│  Toast (React)     PanelView + PanelItem            │
└────────────────────┬────────────────────────────────┘
                     │ WebSocket + JSON-RPC
                     ▼
┌─────────────────────────────────────────────────────┐
│                   Backend (Node.js)                  │
│                                                     │
│  NotificationServiceImpl (бизнес-логика)             │
│    └── NotificationHistoryService (JSON на диске)    │
└─────────────────────────────────────────────────────┘

## Структура проекта

theia-notifications/
├── replace.esbuild.mjs              # Конфиг esbuild для CSS Modules (копировать в browser-app/)
├── src/
│   ├── common/
│   │   ├── protocol.ts              # RPC-интерфейсы (NotificationService, NotificationClient)
│   │   └── notification-types.ts    # Типы (Notification, NotificationAction, Severity)
│   ├── node/
│   │   ├── notification-backend-module.ts
│   │   ├── notification-service-impl.ts
│   │   ├── notification-history-service.ts
│   │   └── test/                    # Backend-тесты
│   └── browser/
│       ├── notification-frontend-module.ts
│       ├── notification-frontend-service.ts
│       ├── notification-client-impl.ts
│       ├── notification-toast-manager.ts
│       ├── notification-toast.tsx
│       ├── notification-toast.module.css
│       ├── notification-test-contribution.ts
│       ├── panel/
│       │   ├── notification-panel-widget.tsx
│       │   ├── notification-panel-hoc.tsx
│       │   ├── notification-panel-view.tsx
│       │   ├── notification-panel-item.tsx
│       │   ├── notification-panel-contribution.ts
│       │   ├── notification-history-service.ts
│       │   └── notification-panel.module.css
│       └── test/                    # Frontend-тесты
└── browser-app/                     # Theia-приложение (в .gitignore)
    └── esbuild.mjs                  # ← скопировать из replace.esbuild.mjs

