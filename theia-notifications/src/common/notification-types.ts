export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface NotificationAction {
    label: string;
    id: string;
}

export interface Notification {
    id: string;
    severity: NotificationSeverity;
    title: string;
    message: string;
    timestamp: number;
    actions?: NotificationAction[];
}
