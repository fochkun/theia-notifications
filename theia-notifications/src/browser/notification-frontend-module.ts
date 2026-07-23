import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { 
    RemoteConnectionProvider, 
    ServiceConnectionProvider 
} from '@theia/core/lib/browser/messaging/service-connection-provider';

import { NotificationFrontendService } from './notification-frontend-service';
import { NotificationClientImpl } from './notification-client-impl';
import { NotificationToastManager } from './notification-toast-manager';
import { NotificationTestContribution } from './notification-test-contribution';
import { 
    NotificationService, 
    NotificationClient, 
    NOTIFICATION_SERVICE_PATH 
} from '../common/protocol';

export default new ContainerModule(bind => {
    // 1. Клиент
    bind(NotificationClientImpl).toSelf().inSingletonScope();
    bind(NotificationClient).toService(NotificationClientImpl);

    // 2. RPC-прокси
    bind(NotificationService).toDynamicValue(ctx => {
        const connection = ctx.container.get<ServiceConnectionProvider>(RemoteConnectionProvider);
        const client = ctx.container.get<NotificationClient>(NotificationClient);
        return connection.createProxy<NotificationService>(NOTIFICATION_SERVICE_PATH, client);
    }).inSingletonScope();

    // 3. Фасад 
    bind(NotificationFrontendService).toSelf().inSingletonScope();

    // 4. Toast Manager
    bind(NotificationToastManager).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(NotificationToastManager);

    // 5. Тестовые команды
    bind(NotificationTestContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(NotificationTestContribution);
    bind(MenuContribution).toService(NotificationTestContribution);
});
