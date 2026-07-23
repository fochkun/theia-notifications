import { DateGroup } from "./notification-panel.types";

export const getDateGroup = (timestamp: number): DateGroup => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    if (timestamp >= startOfToday) return 'today';
    if (timestamp >= startOfYesterday) return 'yesterday';
    return 'earlier';
};
