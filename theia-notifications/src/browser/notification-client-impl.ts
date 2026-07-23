import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core';
import { NotificationClient } from '../common/protocol';
import { Notification } from '../common/notification-types';

@injectable()
export class NotificationClientImpl implements NotificationClient {
    private readonly onNotificationReceivedEmitter = new Emitter<Notification>();
    readonly onNotificationReceived: Event<Notification> = this.onNotificationReceivedEmitter.event;

    onNotification(notification: Notification): void {
        this.onNotificationReceivedEmitter.fire(notification);
    }
}
