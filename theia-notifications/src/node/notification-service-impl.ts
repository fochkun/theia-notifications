import { injectable, inject } from '@theia/core/shared/inversify';
import { NotificationService, NotificationClient } from '../common/protocol';
import { NotificationAction, Notification } from '../common/notification-types';
import { NotificationHistoryService } from './notification-history-service';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class NotificationServiceImpl implements NotificationService {

    @inject(NotificationHistoryService)
    protected readonly historyService!: NotificationHistoryService;

    /** История уведомлений
     * Читается с диска один раз, потом работает из памяти
     */
    private history: Notification[] | undefined;
    private readonly MAX_HISTORY = 100;
    private client: NotificationClient | undefined;

    setClient(client: NotificationClient | undefined): void {
        this.client = client;
    }

    getClient(): NotificationClient | undefined {
        return this.client;
    }

    private async ensureLoaded(): Promise<Notification[]> {
        if (this.history === undefined) {
            this.history = await this.historyService.load();
        }
        return this.history;
    }

    async push(input: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
        const history = await this.ensureLoaded();

        const notification: Notification = {
            ...input,
            id: uuidv4(),
            timestamp: Date.now(),
        };

        history.push(notification);

        if (history.length > this.MAX_HISTORY) {
            this.history = history.slice(-this.MAX_HISTORY);
        }

        await this.historyService.save(this.history!);
        console.log(`[Backend] push() called. Client exists: ${!!this.client}`);
        this.client?.onNotification(notification);
        console.log(`[Backend] onNotification sent to client`);

        return notification;
    }

    async getHistory(): Promise<Notification[]> {
        const history = await this.ensureLoaded();
        return history.map(n => ({ ...n }));
    }

    async actionInvoked(notificationId: string, action: NotificationAction): Promise<void> {
        console.log(`[Backend] Action "${action.label}" invoked on notification ${notificationId}`);
    }

    async clearHistory(): Promise<void> {
        this.history = [];
        await this.historyService.save(this.history);
    }

    dispose(): void {
        this.client = undefined;
        this.history = undefined;
    }
}
