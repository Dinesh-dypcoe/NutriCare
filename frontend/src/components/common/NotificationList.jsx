import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Paper,
    IconButton,
    Box
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationList = () => {
    const { notifications } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    return (
        <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
            <List>
                {notifications.length === 0 ? (
                    <ListItem>
                        <ListItemText 
                            primary="No notifications"
                            secondary="You're all caught up!"
                        />
                    </ListItem>
                ) : (
                    notifications.map((notification, index) => (
                        <ListItem
                            key={index}
                            divider={index !== notifications.length - 1}
                            secondaryAction={
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notification.timestamp).toLocaleString()}
                                </Typography>
                            }
                        >
                            <ListItemIcon>
                                {getIcon(notification.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={notification.title}
                                secondary={notification.message}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </Paper>
    );
};

export default NotificationList; 