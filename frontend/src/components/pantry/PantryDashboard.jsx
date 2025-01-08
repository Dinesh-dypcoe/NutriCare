import { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Tabs,
    Tab,
    Badge,
    IconButton
} from '@mui/material';
import PreparationTasks from './PreparationTasks';
import DeliveryAssignments from './DeliveryAssignments';
import DeliveryPersonnel from './DeliveryPersonnel';
import PantryAnalytics from './PantryAnalytics';
import axios from 'axios';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';

console.log('PantryDashboard rendering');

const PantryDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState({
        pendingPreparations: 0,
        activeDeliveries: 0,
        totalDeliveryPersonnel: 0
    });
    const { notifications } = useNotifications();
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        fetchDashboardStats();
        const newNotifications = notifications.filter(n => !n.read).length;
        setUnreadNotifications(newNotifications);
    }, [notifications]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Pantry Dashboard
                </Typography>
                <Badge badgeContent={unreadNotifications} color="error">
                    <IconButton color="primary">
                        <NotificationsIcon />
                    </IconButton>
                </Badge>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Pending Preparations
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats.pendingPreparations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Active Deliveries
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats.activeDeliveries}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Delivery Personnel
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats.totalDeliveryPersonnel}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Preparation Tasks" />
                    <Tab label="Delivery Assignments" />
                    <Tab label="Delivery Personnel" />
                    <Tab label="Analytics" />
                </Tabs>
            </Paper>

            {activeTab === 0 && <PreparationTasks />}
            {activeTab === 1 && <DeliveryAssignments />}
            {activeTab === 2 && <DeliveryPersonnel />}
            {activeTab === 3 && <PantryAnalytics />}
        </Box>
    );
};

export default PantryDashboard; 