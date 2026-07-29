export const NOTIFICATION_PANEL_CLASSES = {
    // Корневой контейнер панели
    panel: 'theia-notification-panel',

    // Шапка панели
    header: 'theia-notification-panel__header',

    // Блок фильтров
    filters: 'theia-notification-panel__filters',
    filterButton: 'theia-notification-panel__filter-button',
    filterButtonActive: 'theia-notification-panel__filter-button--active',

    // Список уведомлений
    list: 'theia-notification-panel__list',

    // Группа (Сегодня/Вчера/Ранее)
    group: 'theia-notification-panel__group',
    groupHeader: 'theia-notification-panel__group-header',

    // Пустое состояние
    emptyState: 'theia-notification-panel__empty-state',

    // Элемент списка
    item: 'theia-notification-item',
    itemSeverityIcon: 'theia-notification-item__severity-icon',
    itemContent: 'theia-notification-item__content',
    itemHeader: 'theia-notification-item__header',
    itemTitle: 'theia-notification-item__title',
    itemTime: 'theia-notification-item__time',
    itemMessage: 'theia-notification-item__message',
    itemActions: 'theia-notification-item__actions',
    itemActionButton: 'theia-notification-item__action-button',

    // Severity модификаторы
    severityInfo: 'theia-notification-item--severity-info',
    severityWarning: 'theia-notification-item--severity-warning',
    severityError: 'theia-notification-item--severity-error',
} as const;