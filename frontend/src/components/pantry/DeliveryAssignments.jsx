import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';

const DeliveryAssignments = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState('');

    useEffect(() => {
        fetchDeliveries();
        fetchDeliveryPersonnel();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/deliveries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            setError('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryPersonnel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/delivery-personnel', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveryPersonnel(response.data);
        } catch (error) {
            console.error('Error fetching delivery personnel:', error);
        }
    };

    const handleAssign = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/pantry/deliveries/${selectedDelivery._id}/assign`,
                { deliveryPersonId: selectedPersonnel },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAssignDialogOpen(false);
            setSelectedPersonnel('');
            fetchDeliveries();
        } catch (error) {
            console.error('Error assigning delivery:', error);
            setError('Failed to assign delivery');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'in-transit':
                return 'warning';
            default:
                return 'default';
        }
    };

    const sortedDeliveries = [...deliveries].sort((a, b) => {
        if (!a.assignedTo && b.assignedTo) return -1;
        if (a.assignedTo && !b.assignedTo) return 1;
        return 0;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDeliveries.map((delivery) => (
                            <TableRow 
                                key={delivery._id}
                                sx={{
                                    bgcolor: !delivery.assignedTo ? 'action.hover' : 'inherit'
                                }}
                            >
                                <TableCell>{delivery.patientName}</TableCell>
                                <TableCell>{delivery.roomNumber}</TableCell>
                                <TableCell>
                                    {delivery.mealType.charAt(0).toUpperCase() + delivery.mealType.slice(1)}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={delivery.status}
                                        color={getStatusColor(delivery.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {delivery.assignedTo ? delivery.assignedTo.name : 'Not Assigned'}
                                </TableCell>
                                <TableCell>
                                    {!delivery.assignedTo && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => {
                                                setSelectedDelivery(delivery);
                                                setAssignDialogOpen(true);
                                            }}
                                        >
                                            Assign
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>
                    Assign Delivery Personnel
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Personnel</InputLabel>
                        <Select
                            value={selectedPersonnel}
                            onChange={(e) => setSelectedPersonnel(e.target.value)}
                            label="Select Personnel"
                        >
                            {deliveryPersonnel.map((person) => (
                                <MenuItem key={person._id} value={person._id}>
                                    {person.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        variant="contained"
                        disabled={!selectedPersonnel}
                    >
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryAssignments; 