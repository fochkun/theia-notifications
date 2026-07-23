import { injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { NotificationPanelWidget } from './notification-panel-widget';
import { Command } from '@theia/core/lib/common';

export const TOGGLE_NOTIFICATIONS_PANEL: Command = {
    id: 'notification.panel.toggle',
    label: 'Show Notifications'
};

@injectable()
export class NotificationPanelContribution extends AbstractViewContribution<NotificationPanelWidget> {
    constructor() {
        super({
            widgetId: NotificationPanelWidget.ID,
            widgetName: NotificationPanelWidget.LABEL,
            defaultWidgetOptions: {
                area: 'right',
                rank: 300
            },
            toggleCommandId: TOGGLE_NOTIFICATIONS_PANEL.id
        });
    }
}
