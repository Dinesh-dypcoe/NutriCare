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
    IconButton,
    useTheme
} from '@mui/material';
import {
    Restaurant as RestaurantIcon,
    LocalShipping as DeliveryIcon,
    People as PeopleIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import PreparationTasks from './PreparationTasks';
import DeliveryAssignments from './DeliveryAssignments';
import DeliveryPersonnel from './DeliveryPersonnel';
import PantryAnalytics from './PantryAnalytics';
import axios from 'axios';

const PantryDashboard = () => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState({
        pendingPreparations: 0,
        activeDeliveries: 0,
        totalDeliveryPersonnel: 0
    });

    useEffect(() => {
        fetchDashboardStats();
        // Set active tab based on URL
        const path = location.pathname;
        if (path.includes('/preparation')) setActiveTab(0);
        else if (path.includes('/deliveries')) setActiveTab(1);
        else if (path.includes('/personnel')) setActiveTab(2);
        else if (path.includes('/analytics')) setActiveTab(3);
    }, [location]);

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
        switch (newValue) {
            case 0:
                navigate('/pantry/preparation');
                break;
            case 1:
                navigate('/pantry/deliveries');
                break;
            case 2:
                navigate('/pantry/personnel');
                break;
            case 3:
                navigate('/pantry/analytics');
                break;
            default:
                navigate('/pantry/dashboard');
        }
    };

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Pending Preparations
                                </Typography>
                            </Box>
                            <Typography variant="h4">
                                {stats.pendingPreparations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DeliveryIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Active Deliveries
                                </Typography>
                            </Box>
                            <Typography variant="h4">
                                {stats.activeDeliveries}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Delivery Personnel
                                </Typography>
                            </Box>
                            <Typography variant="h4">
                                {stats.totalDeliveryPersonnel}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab 
                        icon={<Badge badgeContent={stats.pendingPreparations} color="error">
                            <RestaurantIcon />
                        </Badge>} 
                        label="Preparation Tasks" 
                    />
                    <Tab 
                        icon={<Badge badgeContent={stats.activeDeliveries} color="error">
                            <DeliveryIcon />
                        </Badge>} 
                        label="Delivery Assignments" 
                    />
                    <Tab icon={<PeopleIcon />} label="Delivery Personnel" />
                    <Tab icon={<AnalyticsIcon />} label="Analytics" />
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