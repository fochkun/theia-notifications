import { injectable, inject } from '@theia/core/shared/inversify';
import { Disposable, DisposableCollection, Emitter, Event } from '@theia/core';
import { NotificationFrontendService } from '../notification-frontend-service';
import { Notification, NotificationAction } from '../../common/notification-types';

@injectable()
export class NotificationHistoryService implements Disposable {
    @inject(NotificationFrontendService)
    protected readonly frontendService!: NotificationFrontendService;

    private readonly toDispose = new DisposableCollection();
    private notifications: Notification[] = [];
    private initialized: boolean = false;
    private initializing: Promise<void> | null = null;

    private readonly onHistoryChangedEmitter = new Emitter<Notification[]>();
    readonly onHistoryChanged: Event<Notification[]> = this.onHistoryChangedEmitter.event;

    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;
        if (this.initializing) return this.initializing;

        this.initializing = (async () => {
            try {

                const history = await this.frontendService.getHistory();
                this.notifications = [...history].sort((a, b) => b.timestamp - a.timestamp);
            } catch (err) {
                this.notifications = [];
            }

            this.toDispose.push(
                this.frontendService.onNotificationReceived(notification => {
                    this.notifications = [notification, ...this.notifications.filter(n => n.id !== notification.id)];
                    this.onHistoryChangedEmitter.fire(this.notifications);
                })
            );

            this.initialized = true;
            this.onHistoryChangedEmitter.fire(this.notifications);
        })();

        return this.initializing;
    }

    getNotifications(): Notification[] {
        this.ensureInitialized();
        return this.notifications;
    }

    async requestHistory(): Promise<Notification[]> {
        await this.ensureInitialized();
        return this.notifications;
    }

    async clearHistory(): Promise<void> {
        await this.ensureInitialized();
        try {
            await this.frontendService.clearHistory();
            this.notifications = [];
            this.onHistoryChangedEmitter.fire(this.notifications);
        } catch (err) {
            console.error('[NotificationHistoryService] Failed to clear history:', err);
        }
    }

    async actionInvoked(notificationId: string, action: NotificationAction): Promise<void> {
        await this.ensureInitialized();
        try {
            await this.frontendService.actionInvoked(notificationId, action);
        } catch (err) {
            console.error('[NotificationHistoryService] Failed to invoke action:', err);
        }
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}
