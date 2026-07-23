import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Notification, NotificationAction } from '../common/notification-types';
import styles from './notification-toast.module.css';

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

    const severityClass = notification.severity === 'info' ? styles.toastSeverityInfo :
                          notification.severity === 'warning' ? styles.toastSeverityWarning :
                          styles.toastSeverityError;
                          
    const animationClass = isVisible ? styles.toastEnter : styles.toastExit;

    return (
        <div 
            className={`${styles.toast} ${severityClass} ${animationClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.content}>
                <div className={styles.title}>{notification.title}</div>
                <div className={styles.message}>{notification.message}</div>
                
                {notification.actions && notification.actions.length > 0 && (
                    <div className={styles.actions}>
                        {notification.actions.map(action => (
                            <button
                                key={action.id}
                                className={`theia-button secondary ${styles.actionButton}`}
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
                    className={`theia-button ${styles.closeButton}`}
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
