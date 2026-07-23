import { injectable } from '@theia/core/shared/inversify';
import { NotificationService, NotificationClient } from '../common/protocol';
import { NotificationAction, Notification } from '../common/notification-types';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class NotificationServiceImpl implements NotificationService {
    private history: Notification[] = [];
    private readonly MAX_HISTORY = 100;
    private client: NotificationClient | undefined;

    setClient(client: NotificationClient | undefined): void {
        this.client = client;
    }

    getClient(): NotificationClient | undefined {
        return this.client;
    }

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

        this.client?.onNotification(notification);

        return notification;
    }

    async getHistory(): Promise<Notification[]> {
        return this.history.map(n => ({ ...n }));
    }

    async actionInvoked(notificationId: string, action: NotificationAction): Promise<void> {
        console.log(`[Backend] Action "${action.label}" invoked on notification ${notificationId}`);
    }

    async clearHistory(): Promise<void> {
        this.history = [];
    }

    dispose(): void {
        this.client = undefined;
        this.history = [];
    }
}
