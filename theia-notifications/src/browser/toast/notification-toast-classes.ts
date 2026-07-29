export const NOTIFICATION_TOAST_CLASSES = {
    // Корневой контейнер для всех тостов
    container: 'theia-notification-toast-container',

    // Сам тост
    toast: 'theia-notification-toast',

    // Severity модификаторы
    severityInfo: 'theia-notification-toast--severity-info',
    severityWarning: 'theia-notification-toast--severity-warning',
    severityError: 'theia-notification-toast--severity-error',

    // Элементы тоста
    content: 'theia-notification-toast__content',
    title: 'theia-notification-toast__title',
    message: 'theia-notification-toast__message',
    actions: 'theia-notification-toast__actions',
    actionButton: 'theia-notification-toast__action-button',
    closeButton: 'theia-notification-toast__close-button',

    // Анимации
    enter: 'theia-notification-toast--enter',
    exit: 'theia-notification-toast--exit',
} as const;