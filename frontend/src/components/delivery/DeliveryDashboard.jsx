import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from '@mui/material';
import api from '../../services/api';
import DeliveryHistory from './DeliveryHistory';
import wsService from '../../services/websocket.js';

const DeliveryDashboard = () => {
    const [state, setState] = useState({
        deliveries: [],
        stats: {
            pendingDeliveries: 0,
            completedToday: 0,
            totalDelivered: 0
        },
        activeTab: 0,
        loading: true,
        error: null,
        selectedDelivery: null,
        dialogOpen: false,
        deliveryNote: ''
    });

    useEffect(() => {
        fetchData();
        
        // Connect to WebSocket
        wsService.connect();

        // Listen for new assignments
        const handleNewAssignment = (data) => {
            console.log('New delivery assignment received:', data);
            fetchData(); // Refresh data when new assignment is received
        };

        // Listen for delivery updates
        const handleDeliveryUpdate = (data) => {
            console.log('Delivery update received:', data);
            fetchData(); // Refresh data when delivery is updated
        };

        wsService.addListener('new_delivery_assignment', handleNewAssignment);
        wsService.addListener('delivery_update', handleDeliveryUpdate);

        // Cleanup
        return () => {
            wsService.removeListener('new_delivery_assignment', handleNewAssignment);
            wsService.removeListener('delivery_update', handleDeliveryUpdate);
        };
    }, []);

    const fetchData = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            
            const [deliveriesRes, statsRes] = await Promise.all([
                api.get('/delivery/my-deliveries'),
                api.get('/delivery/stats')
            ]);

            console.log('Fetched data:', {
                deliveries: deliveriesRes.data,
                stats: statsRes.data
            });

            setState(prev => ({
                ...prev,
                deliveries: deliveriesRes.data || [],
                stats: statsRes.data || {
                    pendingDeliveries: 0,
                    completedToday: 0,
                    totalDelivered: 0
                },
                loading: false,
                error: null
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load data. Please try again.'
            }));
        }
    };

    const handleMarkDelivered = async () => {
        try {
            await api.put(`/delivery/mark-delivered/${state.selectedDelivery._id}`, {
                notes: state.deliveryNote
            });
            setState(prev => ({
                ...prev,
                dialogOpen: false,
                deliveryNote: ''
            }));
            fetchData(); // Refresh data after marking as delivered
        } catch (error) {
            console.error('Error marking delivery:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to update delivery status'
            }));
        }
    };

    const renderStats = () => (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Pending Deliveries</Typography>
                        <Typography variant="h4" color="warning.main">
                            {state.stats.pendingDeliveries}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Completed Today</Typography>
                        <Typography variant="h4" color="success.main">
                            {state.stats.completedToday}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Total Delivered</Typography>
                        <Typography variant="h4" color="primary">
                            {state.stats.totalDelivered}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderDeliveryTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Patient Name</TableCell>
                        <TableCell>Room Number</TableCell>
                        <TableCell>Meal Type</TableCell>
                        <TableCell>Scheduled Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Dietary Requirements</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {state.deliveries.length > 0 ? (
                        state.deliveries.map((delivery) => (
                            <TableRow key={delivery._id}>
                                <TableCell>{delivery.patientName}</TableCell>
                                <TableCell>{delivery.roomNumber}</TableCell>
                                <TableCell>{delivery.mealType}</TableCell>
                                <TableCell>
                                    {delivery.scheduledTime ? 
                                        new Date(delivery.scheduledTime).toLocaleString() : 
                                        'Not scheduled'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={delivery.status}
                                        color={
                                            delivery.status === 'pending' ? 'warning' :
                                            delivery.status === 'assigned' ? 'info' :
                                            delivery.status === 'in-transit' ? 'primary' :
                                            'success'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {delivery.dietaryRequirements?.length > 0 
                                        ? delivery.dietaryRequirements.join(', ') 
                                        : 'None'}
                                </TableCell>
                                <TableCell>
                                    {delivery.canMarkDelivered && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => setState(prev => ({
                                                ...prev,
                                                selectedDelivery: delivery,
                                                dialogOpen: true
                                            }))}
                                        >
                                            Mark Delivered
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No active deliveries found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    if (state.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Delivery Dashboard
            </Typography>

            {state.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {state.error}
                </Alert>
            )}

            {renderStats()}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={state.activeTab}
                    onChange={(_, newValue) => setState(prev => ({ ...prev, activeTab: newValue }))}
                    centered
                >
                    <Tab label="Active Deliveries" />
                    <Tab label="Delivery History" />
                </Tabs>
            </Paper>

            {state.activeTab === 0 ? renderDeliveryTable() : <DeliveryHistory />}

            <Dialog open={state.dialogOpen} onClose={() => setState(prev => ({ ...prev, dialogOpen: false }))}>
                <DialogTitle>Complete Delivery</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Delivery Notes"
                        multiline
                        rows={4}
                        value={state.deliveryNote}
                        onChange={(e) => setState(prev => ({ ...prev, deliveryNote: e.target.value }))}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, dialogOpen: false }))}>
                        Cancel
                    </Button>
                    <Button onClick={handleMarkDelivered} variant="contained" color="success">
                        Confirm Delivery
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryDashboard; 