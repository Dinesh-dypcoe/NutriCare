import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import websocketService from '../services/websocket.js';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        websocketService.connect();
        websocketService.addListener('notifications', handleNewNotification);

        return () => {
            websocketService.removeListener('notifications');
            websocketService.disconnect();
        };
    }, []);

    const handleNewNotification = (notification) => {
        setNotifications(prev => [...prev, notification]);
        setCurrentNotification(notification);
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
            {children}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={currentNotification?.type || 'info'}
                    sx={{ width: '100%' }}
                >
                    {currentNotification?.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}; 