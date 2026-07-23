import { injectable, inject } from '@theia/core/shared/inversify';
import { 
    Command, 
    CommandContribution, 
    CommandRegistry, 
    MenuContribution, 
    MenuModelRegistry,
    MessageService 
} from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser';
import { NotificationFrontendService } from './notification-frontend-service';

export const TEST_NOTIFICATION_COMMAND: Command = {
    id: 'notification.test.info',
    label: 'Test Info Notification'
};

export const TEST_WARNING_COMMAND: Command = {
    id: 'notification.test.warning',
    label: 'Test Warning Notification'
};

export const TEST_ERROR_COMMAND: Command = {
    id: 'notification.test.error',
    label: 'Test Error Notification'
};

@injectable()
export class NotificationTestContribution implements CommandContribution, MenuContribution {
    @inject(NotificationFrontendService)
    protected readonly frontendService!: NotificationFrontendService;

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TEST_NOTIFICATION_COMMAND, {
            execute: async () => {
                try {
                    const notification = await this.frontendService.push({
                        severity: 'info',
                        title: 'Test Info Notification',
                        message: 'This is a test info notification that will auto-close in 5 seconds.',
                        actions: [
                            { id: 'action1', label: 'Action 1' },
                            { id: 'action2', label: 'Action 2' }
                        ]
                    });
                    console.log('Info notification sent:', notification.id);
                } catch (error) {
                    this.messageService.error(`Failed to send info notification: ${error}`);
                }
            }
        });

        registry.registerCommand(TEST_WARNING_COMMAND, {
            execute: async () => {
                try {
                    const notification = await this.frontendService.push({
                        severity: 'warning',
                        title: 'Test Warning Notification',
                        message: 'This is a test warning notification. It will also auto-close in 5 seconds.',
                        actions: [
                            { id: 'warningAction', label: 'Acknowledge' }
                        ]
                    });
                    console.log('Warning notification sent:', notification.id);
                } catch (error) {
                    this.messageService.error(`Failed to send warning notification: ${error}`);
                }
            }
        });

        registry.registerCommand(TEST_ERROR_COMMAND, {
            execute: async () => {
                try {
                    const notification = await this.frontendService.push({
                        severity: 'error',
                        title: 'Test Error Notification',
                        message: 'This is a test error notification. It will stay until you close it manually.',
                        actions: [
                            { id: 'retryAction', label: 'Retry' },
                            { id: 'ignoreAction', label: 'Ignore' }
                        ]
                    });
                    console.log('Error notification sent:', notification.id);
                } catch (error) {
                    this.messageService.error(`Failed to send error notification: ${error}`);
                }
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TEST_NOTIFICATION_COMMAND.id,
            label: TEST_NOTIFICATION_COMMAND.label,
            order: 'a1'
        });

        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TEST_WARNING_COMMAND.id,
            label: TEST_WARNING_COMMAND.label,
            order: 'a2'
        });

        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TEST_ERROR_COMMAND.id,
            label: TEST_ERROR_COMMAND.label,
            order: 'a3'
        });
    }
}
