import { injectable, inject } from '@theia/core/shared/inversify';
import { Event } from '@theia/core';
import { NotificationService } from '../common/protocol';
import { Notification, NotificationAction } from '../common/notification-types';
import { NotificationClientImpl } from './notification-client-impl';

@injectable()
export class NotificationFrontendService {
    @inject(NotificationService)
    protected readonly serviceProxy!: NotificationService;

    @inject(NotificationClientImpl)
    protected readonly clientImpl!: NotificationClientImpl;

    get onNotificationReceived(): Event<Notification> {
        return this.clientImpl.onNotificationReceived;
    }

    async push(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
        return this.serviceProxy.push(notification);
    }

    async getHistory(): Promise<Notification[]> {
        return this.serviceProxy.getHistory();
    }

    async actionInvoked(notificationId: string, action: NotificationAction): Promise<void> {
        return this.serviceProxy.actionInvoked(notificationId, action);
    }

    async clearHistory(): Promise<void> {
        return this.serviceProxy.clearHistory();
    }
}