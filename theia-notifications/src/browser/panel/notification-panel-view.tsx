import * as React from 'react';
import { Notification } from '../../common/notification-types';
import { NotificationItem } from './notification-panel-item';
import styles from './notification-panel.module.css';
import { getDateGroup } from './notification-panel.utils';
import { DateGroup, FilterType, NotificationPanelViewProps } from './notification-panel.types';


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
