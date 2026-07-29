import * as React from 'react';
import { Notification } from '../../common/notification-types';
import { NotificationItem } from './notification-panel-item';
import { getDateGroup } from './notification-panel.utils';
import { DateGroup, FilterType, NotificationPanelViewProps } from './notification-panel.types';
import { NOTIFICATION_PANEL_CLASSES } from './notification-panel-classes';

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
        <div className={NOTIFICATION_PANEL_CLASSES.panel}>
            <div className={NOTIFICATION_PANEL_CLASSES.header}>
                <button
                    className="theia-button secondary"
                    onClick={onClearHistory}
                    disabled={notifications.length === 0}
                    aria-label="Clear all notifications"
                >
                    Clear All
                </button>
            </div>

            <div className={NOTIFICATION_PANEL_CLASSES.filters} role="tablist" aria-label="Filter by severity">
                {(['all', 'info', 'warning', 'error'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        role="tab"
                        aria-selected={filter === f}
                        className={`${NOTIFICATION_PANEL_CLASSES.filterButton} ${filter === f ? NOTIFICATION_PANEL_CLASSES.filterButtonActive : ''}`}
                        onClick={() => onFilterChange(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className={NOTIFICATION_PANEL_CLASSES.list}>
                {notifications.length === 0 ? (
                    <div className={NOTIFICATION_PANEL_CLASSES.emptyState}>No notifications</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className={NOTIFICATION_PANEL_CLASSES.emptyState}>No {filter} notifications</div>
                ) : (
                    (['today', 'yesterday', 'earlier'] as const).map(group => {
                        const items = groupedNotifications[group];
                        if (items.length === 0) return null;
                        return (
                            <div key={group} className={NOTIFICATION_PANEL_CLASSES.group}>
                                <div className={NOTIFICATION_PANEL_CLASSES.groupHeader}>{GROUP_LABELS[group]}</div>
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
