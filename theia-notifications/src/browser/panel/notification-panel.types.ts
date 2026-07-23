import { Notification } from '../../common/notification-types';
import { NotificationAction, NotificationSeverity } from "../../common/notification-types";

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