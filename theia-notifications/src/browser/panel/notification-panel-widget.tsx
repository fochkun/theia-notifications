import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { NotificationHistoryService } from './notification-history-service';
import { NotificationPanelHOC } from './notification-panel-hoc';
import * as React from 'react';

export const NOTIFICATION_PANEL_WIDGET_ID = 'notification-panel';
export const NOTIFICATION_PANEL_WIDGET_LABEL = 'Notifications';
export const NOTIFICATION_PANEL_WIDGET_ICON = 'codicon codicon-bell';

@injectable()
export class NotificationPanelWidget extends ReactWidget {
    static readonly ID = NOTIFICATION_PANEL_WIDGET_ID;
    static readonly LABEL = NOTIFICATION_PANEL_WIDGET_LABEL;

    @inject(NotificationHistoryService)
    protected readonly historyService!: NotificationHistoryService;

    @postConstruct()
    protected init(): void {
        this.id = NOTIFICATION_PANEL_WIDGET_ID;
        this.title.label = NOTIFICATION_PANEL_WIDGET_LABEL;
        this.title.caption = NOTIFICATION_PANEL_WIDGET_LABEL;
        this.title.iconClass = NOTIFICATION_PANEL_WIDGET_ICON;
        this.title.closable = true;
        this.addClass('notification-panel-widget');
    }

    protected render(): React.ReactNode {
        return <NotificationPanelHOC historyService={this.historyService} />;
    }
}
