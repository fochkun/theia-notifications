// src/browser/panel/notification-panel-hoc.tsx
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { NotificationHistoryService } from './notification-history-service';
import { NotificationPanelView, FilterType } from './notification-panel-view';
import { NotificationAction } from '../../common/notification-types';

interface NotificationPanelHOCProps {
    historyService: NotificationHistoryService;
}

export const NotificationPanelHOC: React.FC<NotificationPanelHOCProps> = ({ historyService }) => {
    const [notifications, setNotifications] = useState(historyService.getNotifications());
    const [filter, setFilter] = useState<FilterType>('all');
    const [invokedActions, setInvokedActions] = useState<Set<string>>(new Set());

    useEffect(() => {
        const disposable = historyService.onHistoryChanged(newNotifications => {
            setNotifications(newNotifications);
        });
        return () => disposable.dispose();
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
