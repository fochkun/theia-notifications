import { RpcServer } from '@theia/core';
import { Notification, NotificationAction } from './notification-types';

export const NOTIFICATION_SERVICE_PATH = '/services/notification';

export const NotificationClient = Symbol('NotificationClient');
export interface NotificationClient {
    onNotification(notification: Notification): void;
}

export const NotificationService = Symbol('NotificationService');
export interface NotificationService extends RpcServer<NotificationClient> {
    push(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification>;
    getHistory(): Promise<Notification[]>;
    actionInvoked(notificationId: string, action: NotificationAction): Promise<void>;
    clearHistory(): Promise<void>;
}
