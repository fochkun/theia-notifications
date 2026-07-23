import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { 
    RemoteConnectionProvider, 
    ServiceConnectionProvider 
} from '@theia/core/lib/browser/messaging/service-connection-provider';

import { NotificationFrontendService } from './rpc/notification-frontend-service';
import { NotificationClientImpl } from './rpc/notification-client-impl';
import { NotificationHistoryService } from './panel/notification-history-service';
import { NotificationToastManager } from './toast/notification-toast-manager';
import { NotificationTestContribution } from './notification-test-contribution';
import { NotificationPanelWidget } from './panel/notification-panel-widget';
import { NotificationPanelContribution } from './panel/notification-panel-contribution';
import { 
    NotificationService, 
    NotificationClient, 
    NOTIFICATION_SERVICE_PATH 
} from '../common/protocol';

export default new ContainerModule(bind => {
    // Клиент
    bind(NotificationClientImpl).toSelf().inSingletonScope();
    bind(NotificationClient).toService(NotificationClientImpl);

    // RPC-прокси
    bind(NotificationService).toDynamicValue(ctx => {
        const connection = ctx.container.get<ServiceConnectionProvider>(RemoteConnectionProvider);
        const client = ctx.container.get<NotificationClient>(NotificationClient);
        return connection.createProxy<NotificationService>(NOTIFICATION_SERVICE_PATH, client);
    }).inSingletonScope();

    // Фасад 
    bind(NotificationFrontendService).toSelf().inSingletonScope();
    bind(NotificationHistoryService).toSelf().inSingletonScope();

    // Toast Manager
    bind(NotificationToastManager).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(NotificationToastManager);

    // Панель истории
    bind(NotificationPanelWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: NotificationPanelWidget.ID,
        createWidget: () => ctx.container.get<NotificationPanelWidget>(NotificationPanelWidget)
    })).inSingletonScope();

    // Тестовые команды
    bind(NotificationPanelContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(NotificationPanelContribution);
    bind(MenuContribution).toService(NotificationPanelContribution);

    bind(NotificationTestContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(NotificationTestContribution);
    bind(MenuContribution).toService(NotificationTestContribution);
});
