import React, { useState, useEffect } from 'react';
import { 
    Grid, 
    Paper, 
    Typography, 
    Box,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import {
    Person as PersonIcon,
    LocalShipping as DeliveryIcon,
    Restaurant as DietIcon,
    Add as AddIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ManagerDashboard = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalPatients: 0,
        pendingDeliveries: 0,
        activeDietCharts: 0
    });
    const [recentActivities, setRecentActivities] = useState({
        recentDeliveries: [],
        recentDietCharts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, activitiesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/manager/dashboard-stats', { headers }),
                axios.get('http://localhost:5000/api/manager/recent-activities', { headers })
            ]);

            setStats(statsRes.data);
            setRecentActivities(activitiesRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const DashboardCard = ({ title, value, icon, color }) => (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {title}
                        </Typography>
                    </Box>
                    <Typography variant="h3" color={color}>
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Manager Dashboard
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <DashboardCard 
                        title="Total Patients" 
                        value={stats.totalPatients}
                        icon={<PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <DashboardCard 
                        title="Pending Deliveries" 
                        value={stats.pendingDeliveries}
                        icon={<DeliveryIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <DashboardCard 
                        title="Active Diet Charts" 
                        value={stats.activeDietCharts}
                        icon={<DietIcon sx={{ color: theme.palette.success.main, fontSize: 40 }} />}
                        color="success.main"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Quick Actions</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Button 
                                    component={Link} 
                                    to="/manager/patients/new" 
                                    variant="contained" 
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Add New Patient
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button 
                                    component={Link} 
                                    to="/manager/diet-charts/new" 
                                    variant="contained"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Create Diet Chart
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activities
                        </Typography>
                        <List>
                            {recentActivities.recentDeliveries.map((delivery, index) => (
                                <React.Fragment key={delivery._id}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <TimelineIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Delivery for ${delivery.patientId.name}`}
                                            secondary={`Room ${delivery.patientId.roomNumber} - ${delivery.mealType}`}
                                        />
                                    </ListItem>
                                    {index < recentActivities.recentDeliveries.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ManagerDashboard; 