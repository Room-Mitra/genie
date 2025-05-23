// NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NotificationStack from './NotificationStack';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, severity = 'info', autoHideDuration = 6000) => {
        const id = uuidv4();
        setNotifications(prev => [
            ...prev,
            {
                id,
                message,
                severity,
                autoHideDuration,
                open: true
            }
        ]);

        return id; // Return ID for manual closing if needed
    }, []);

    const closeNotification = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, open: false }
                    : notification
            )
        );

        // Remove notification after fade out animation
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 300);
    }, []);

    const value = { showNotification, closeNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationStack notifications={notifications} onClose={closeNotification} />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);