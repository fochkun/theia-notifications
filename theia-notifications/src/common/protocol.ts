import { Event } from '@theia/core';
import { Notification, NotificationAction } from './notification-types';

export const NOTIFICATION_SERVICE_PATH = '/services/notification';
export const NotificationService = Symbol('NotificationService');

export interface NotificationService {
    push(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification>;
    getHistory(): Promise<Notification[]>;
    actionInvoked(notificationId: string, action: NotificationAction): Promise<void>;
    clearHistory(): Promise<void>;
    onNotification: Event<Notification>;
}
