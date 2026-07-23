import { ContainerModule } from '@theia/core/shared/inversify';
import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { NotificationService, NotificationClient, NOTIFICATION_SERVICE_PATH } from '../common/protocol';
import { NotificationServiceImpl } from './notification-service-impl';

export default new ContainerModule(bind => {
    bind(NotificationServiceImpl).toSelf().inSingletonScope();
    bind(NotificationService).toService(NotificationServiceImpl);

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new RpcConnectionHandler<NotificationClient>(NOTIFICATION_SERVICE_PATH, client => {
            const service = ctx.container.get<NotificationServiceImpl>(NotificationServiceImpl);
            service.setClient(client);
            return service;
        })
    ).inSingletonScope();
});
