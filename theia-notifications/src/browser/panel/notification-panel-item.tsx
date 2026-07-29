import * as React from 'react';
import { Notification, NotificationAction } from '../../common/notification-types';
import { NOTIFICATION_PANEL_CLASSES } from './notification-panel-classes';

interface NotificationItemProps {
    notification: Notification;
    invokedActions: Set<string>;
    onAction: (notificationId: string, action: NotificationAction) => void;
}

const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, invokedActions, onAction }) => {
    const severityIcon = notification.severity === 'info' ? '●'
        : notification.severity === 'warning' ? '▲'
        : '✕';

    const severityClass = notification.severity === 'info'
        ? NOTIFICATION_PANEL_CLASSES.severityInfo
        : notification.severity === 'warning'
            ? NOTIFICATION_PANEL_CLASSES.severityWarning
            : NOTIFICATION_PANEL_CLASSES.severityError;

    return (
        <div className={`${NOTIFICATION_PANEL_CLASSES.item} ${severityClass}`}>
            <div className={NOTIFICATION_PANEL_CLASSES.itemSeverityIcon}>{severityIcon}</div>
            <div className={NOTIFICATION_PANEL_CLASSES.itemContent}>
                <div className={NOTIFICATION_PANEL_CLASSES.itemHeader}>
                    <span className={NOTIFICATION_PANEL_CLASSES.itemTitle}>{notification.title}</span>
                    <span className={NOTIFICATION_PANEL_CLASSES.itemTime}>{formatTime(notification.timestamp)}</span>
                </div>
                <div className={NOTIFICATION_PANEL_CLASSES.itemMessage}>{notification.message}</div>
                {notification.actions && notification.actions.length > 0 && (
                    <div className={NOTIFICATION_PANEL_CLASSES.itemActions}>
                        {notification.actions.map(action => {
                            const key = `${notification.id}:${action.id}`;
                            const isInvoked = invokedActions.has(key);
                            return (
                                <button
                                    key={action.id}
                                    className={`theia-button secondary ${NOTIFICATION_PANEL_CLASSES.itemActionButton}`}
                                    disabled={isInvoked}
                                    onClick={() => onAction(notification.id, action)}
                                    aria-label={`${action.label} for ${notification.title}`}
                                >
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
