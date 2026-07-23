import { injectable, inject } from '@theia/core/shared/inversify';
import { Disposable, DisposableCollection } from '@theia/core';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { NotificationFrontendService } from '../rpc/notification-frontend-service';
import { Notification, NotificationAction } from '../../common/notification-types';
import { NotificationToast } from './notification-toast';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import styles from './notification-toast.module.css';

@injectable()
export class NotificationToastManager implements FrontendApplicationContribution, Disposable {
    @inject(NotificationFrontendService)
    protected readonly frontendService!: NotificationFrontendService;

    private readonly toDispose = new DisposableCollection();
    private container: HTMLElement | null = null;
    private toasts: Map<string, { root: Root; notification: Notification }> = new Map();

    onStart(): void {
        this.container = document.createElement('div');
        this.container.className = styles.container;
        document.body.appendChild(this.container);

        this.toDispose.push(
            this.frontendService.onNotificationReceived(notification => {
                this.addToast(notification);
            })
        );
    }

    private addToast(notification: Notification): void {
        if (!this.container) return;

        const toastElement = document.createElement('div');
        this.container.appendChild(toastElement);

        const root = createRoot(toastElement);
        this.toasts.set(notification.id, { root, notification });

        root.render(
            React.createElement(NotificationToast, {
                notification,
                onClose: () => this.removeToast(notification.id),
                onActionInvoked: (action: NotificationAction) => {
                    this.frontendService.actionInvoked(notification.id, action);
                }
            })
        );
    }

    private removeToast(notificationId: string): void {
        const toastData = this.toasts.get(notificationId);
        if (toastData) {
            toastData.root.unmount();
            this.toasts.delete(notificationId);
        }
    }

    onStop(): void {
        this.dispose();
    }

    dispose(): void {
        this.toasts.forEach((toastData) => {
            toastData.root.unmount();
        });
        this.toasts.clear();

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.toDispose.dispose();
    }
}
