import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { NotificationHistoryService } from './notification-history-service';
import { NotificationPanelView } from './notification-panel-view';
import { Notification, NotificationAction } from '../../common/notification-types';
import { FilterType } from './notification-panel.types';

interface NotificationPanelHOCProps {
    historyService: NotificationHistoryService;
}

export const NotificationPanelHOC: React.FC<NotificationPanelHOCProps> = ({ historyService }) => {
    const [notifications, setNotifications] = useState<Notification[]>([{id:'1', message:'test', severity: 'info', timestamp: 12345678123, title: 'hello'}]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [invokedActions, setInvokedActions] = useState<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;

        const disposable = historyService.onHistoryChanged(newNotifications => {
            if (!cancelled) {
                setNotifications(newNotifications);
            }
        });

        historyService.requestHistory().then(notifs => {
            if (!cancelled) {
                setNotifications(notifs);
            }
        });

        return () => {
            cancelled = true;
            disposable.dispose();
        };
    }, [historyService]);

    const handleClearHistory = useCallback(() => {
        historyService.clearHistory();
    }, [historyService]);

    const handleActionInvoked = useCallback((notificationId: string, action: NotificationAction) => {
        const key = `${notificationId}:${action.id}`;
        setInvokedActions(prev => new Set(prev).add(key));
        historyService.actionInvoked(notificationId, action);
    }, [historyService]);

    return (
        <NotificationPanelView
            notifications={notifications}
            filter={filter}
            onFilterChange={setFilter}
            onClearHistory={handleClearHistory}
            onActionInvoked={handleActionInvoked}
            invokedActions={invokedActions}
        />
    );
};
