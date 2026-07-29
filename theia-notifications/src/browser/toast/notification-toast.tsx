import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Notification, NotificationAction } from '../../common/notification-types';
import { NOTIFICATION_TOAST_CLASSES } from './notification-toast-classes';
import './notification-toast.css';

interface NotificationToastProps {
    notification: Notification;
    onClose: () => void;
    onActionInvoked: (action: NotificationAction) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    notification,
    onClose,
    onActionInvoked
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<number | null>(null);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        if (notification.severity !== 'error') {
            clearTimer();
            timeoutRef.current = window.setTimeout(() => {
                handleClose();
            }, 5000);
        }
    }, [notification.severity, clearTimer]);

    useEffect(() => {
        startTimer();
        return () => clearTimer();
    }, [startTimer, clearTimer]);

    const handleMouseEnter = () => clearTimer();
    const handleMouseLeave = () => startTimer();

    const handleClose = () => {
        clearTimer();
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleActionClick = (action: NotificationAction) => {
        onActionInvoked(action);
        handleClose();
    };

    const severityClass =
        notification.severity === 'info' ? NOTIFICATION_TOAST_CLASSES.severityInfo :
        notification.severity === 'warning' ? NOTIFICATION_TOAST_CLASSES.severityWarning :
        NOTIFICATION_TOAST_CLASSES.severityError;

    const animationClass = isVisible ? NOTIFICATION_TOAST_CLASSES.enter : NOTIFICATION_TOAST_CLASSES.exit;

    return (
        <div
            className={`${NOTIFICATION_TOAST_CLASSES.toast} ${severityClass} ${animationClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={NOTIFICATION_TOAST_CLASSES.content}>
                <div className={NOTIFICATION_TOAST_CLASSES.title}>{notification.title}</div>
                <div className={NOTIFICATION_TOAST_CLASSES.message}>{notification.message}</div>
                {notification.actions && notification.actions.length > 0 && (
                    <div className={NOTIFICATION_TOAST_CLASSES.actions}>
                        {notification.actions.map(action => (
                            <button
                                key={action.id}
                                className={`theia-button secondary ${NOTIFICATION_TOAST_CLASSES.actionButton}`}
                                onClick={() => handleActionClick(action)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {notification.severity === 'error' && (
                <button
                    className={`theia-button ${NOTIFICATION_TOAST_CLASSES.closeButton}`}
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
