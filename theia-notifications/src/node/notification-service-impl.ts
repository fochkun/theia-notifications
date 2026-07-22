import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core';
import { NotificationService } from '../common/protocol';
import { v4 as uuidv4 } from 'uuid';
import { NotificationAction, Notification } from '../common/notification-types';

@injectable()
export class NotificationServiceImpl implements NotificationService {
    private history: Notification[] = [];
    private readonly MAX_HISTORY = 100;

    private readonly onNotificationEmitter = new Emitter<Notification>();
    readonly onNotification: Event<Notification> = this.onNotificationEmitter.event;

    async push(input: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
        const notification: Notification = {
            ...input,
            id: uuidv4(),
            timestamp: Date.now(),
        };

        this.history.push(notification);

        if (this.history.length > this.MAX_HISTORY) {
            this.history = this.history.slice(-this.MAX_HISTORY);
        }

        this.onNotificationEmitter.fire(notification);
        return notification;
    }

    async getHistory(): Promise<Notification[]> {
        // вряд ли пригодится, но на всякий случай сделаю так
        return this.history.map(n => ({ ...n }));
    }

    async actionInvoked(notificationId: string, action: NotificationAction): Promise<void> {
        console.log(`[Backend] Action "${action.label}" invoked on notification ${notificationId}`);
    }

    async clearHistory(): Promise<void> {
        this.history = [];
    }
}
