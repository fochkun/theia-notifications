// src/browser/panel/notification-panel-view.tsx
import * as React from 'react';
import { Notification, NotificationAction, NotificationSeverity } from '../../common/notification-types';
import { NotificationItem } from './notification-panel-item';
import styles from './notification-panel.module.css';

export type FilterType = 'all' | NotificationSeverity;
export type DateGroup = 'today' | 'yesterday' | 'earlier';

export interface NotificationPanelViewProps {
    notifications: Notification[];
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onClearHistory: () => void;
    onActionInvoked: (notificationId: string, action: NotificationAction) => void;
    invokedActions: Set<string>;
}

const getDateGroup = (timestamp: number): DateGroup => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    if (timestamp >= startOfToday) return 'today';
    if (timestamp >= startOfYesterday) return 'yesterday';
    return 'earlier';
};

const GROUP_LABELS: Record<DateGroup, string> = {
    today: 'Сегодня',
    yesterday: 'Вчера',
    earlier: 'Ранее'
};

export const NotificationPanelView: React.FC<NotificationPanelViewProps> = ({
    notifications,
    filter,
    onFilterChange,
    onClearHistory,
    onActionInvoked,
    invokedActions
}) => {
    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => n.severity === filter);

    const groupedNotifications: Record<DateGroup, Notification[]> = {
        today: [],
        yesterday: [],
        earlier: []
    };

    for (const n of filteredNotifications) {
        groupedNotifications[getDateGroup(n.timestamp)].push(n);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>🔔 Notifications</h2>
                <button
                    className="theia-button secondary"
                    onClick={onClearHistory}
                    disabled={notifications.length === 0}
                    aria-label="Clear all notifications"
                >
                    Clear All
                </button>
            </div>

            <div className={styles.filters} role="tablist" aria-label="Filter by severity">
                {(['all', 'info', 'warning', 'error'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        role="tab"
                        aria-selected={filter === f}
                        className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ''}`}
                        onClick={() => onFilterChange(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>No notifications</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className={styles.emptyState}>No {filter} notifications</div>
                ) : (
                    (['today', 'yesterday', 'earlier'] as const).map(group => {
                        const items = groupedNotifications[group];
                        if (items.length === 0) return null;
                        return (
                            <div key={group} className={styles.group}>
                                <div className={styles.groupHeader}>{GROUP_LABELS[group]}</div>
                                {items.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        invokedActions={invokedActions}
                                        onAction={onActionInvoked}
                                    />
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
