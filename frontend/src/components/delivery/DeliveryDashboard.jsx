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
    Tab
} from '@mui/material';
import axios from 'axios';
import DeliveryHistory from './DeliveryHistory';

const DeliveryDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [stats, setStats] = useState({
        pendingDeliveries: 0,
        completedToday: 0,
        totalDelivered: 0
    });
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchDeliveries();
        fetchStats();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/delivery/assigned-deliveries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/delivery/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleMarkDelivered = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/delivery/mark-delivered/${deliveryId}`,
                { notes: deliveryNote },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setDialogOpen(false);
            setDeliveryNote('');
            fetchDeliveries();
            fetchStats();
        } catch (error) {
            console.error('Error marking delivery as complete:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in-transit':
                return 'info';
            case 'delivered':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Delivery Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Pending Deliveries
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {stats.pendingDeliveries}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Completed Today
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {stats.completedToday}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Delivered
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats.totalDelivered}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Active Deliveries" />
                    <Tab label="Delivery History" />
                </Tabs>
            </Paper>

            {activeTab === 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Meal Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deliveries.map((delivery) => (
                                <TableRow key={delivery._id}>
                                    <TableCell>{delivery.patientName}</TableCell>
                                    <TableCell>{delivery.roomNumber}</TableCell>
                                    <TableCell>{delivery.mealType}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={delivery.status}
                                            color={getStatusColor(delivery.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            disabled={delivery.status === 'delivered'}
                                            onClick={() => {
                                                setSelectedDelivery(delivery);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            Mark Delivered
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <DeliveryHistory />
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Mark Delivery as Complete</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Delivery Notes (Optional)"
                        multiline
                        rows={4}
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={() => handleMarkDelivered(selectedDelivery._id)}
                        variant="contained"
                        color="success"
                    >
                        Confirm Delivery
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryDashboard; 