import * as React from 'react';
import { Notification, NotificationAction } from '../../common/notification-types';
import styles from './notification-panel.module.css';

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

    const severityClass = notification.severity === 'info' ? styles.severityInfo
        : notification.severity === 'warning' ? styles.severityWarning
        : styles.severityError;

    return (
        <div className={styles.item}>
            <div className={`${styles.severityIcon} ${severityClass}`}>{severityIcon}</div>
            <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>{notification.title}</span>
                    <span className={styles.itemTime}>{formatTime(notification.timestamp)}</span>
                </div>
                <div className={styles.itemMessage}>{notification.message}</div>
                {notification.actions && notification.actions.length > 0 && (
                    <div className={styles.itemActions}>
                        {notification.actions.map(action => {
                            const key = `${notification.id}:${action.id}`;
                            const isInvoked = invokedActions.has(key);
                            return (
                                <button
                                    key={action.id}
                                    className={`theia-button secondary ${styles.itemActionButton}`}
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
