import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
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
            setSelectedDelivery(null);
            setSelectedPersonnel('');
            fetchDeliveries();
        } catch (error) {
            console.error('Error assigning delivery:', error);
            setError('Failed to assign delivery');
        }
    };

    const handleMarkDelivered = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/pantry/deliveries/${deliveryId}/delivered`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDeliveries();
        } catch (error) {
            console.error('Error marking delivery as delivered:', error);
            setError('Failed to update delivery status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'assigned':
                return 'info';
            case 'in-transit':
                return 'primary';
            case 'delivered':
                return 'success';
            default:
                return 'default';
        }
    };

    const renderActionButtons = (delivery) => {
        if (delivery.status === 'delivered') {
            return (
                <Chip
                    label="Delivered"
                    color="success"
                    size="small"
                />
            );
        }

        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                        setSelectedDelivery(delivery);
                        setAssignDialogOpen(true);
                    }}
                    disabled={delivery.assignedTo !== null}
                >
                    {delivery.assignedTo ? 'Assigned' : 'Assign'}
                </Button>
                {delivery.assignedTo && delivery.status !== 'delivered' && (
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleMarkDelivered(delivery._id)}
                    >
                        Mark Delivered
                    </Button>
                )}
            </Box>
        );
    };

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
                        {deliveries.map((delivery) => (
                            <TableRow key={delivery._id}>
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
                                    {renderActionButtons(delivery)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
            >
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