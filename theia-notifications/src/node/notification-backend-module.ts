import { ContainerModule } from '@theia/core/shared/inversify';
import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';
import { NotificationService, NOTIFICATION_SERVICE_PATH } from '../common/protocol';
import { NotificationServiceImpl } from './notification-service-impl';

export default new ContainerModule(bind => {
    bind(NotificationServiceImpl).toSelf().inSingletonScope();
    
    bind(NotificationService).toService(NotificationServiceImpl);

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new RpcConnectionHandler(NOTIFICATION_SERVICE_PATH, () =>
            ctx.container.get(NotificationServiceImpl)
        )
    ).inSingletonScope();
});
