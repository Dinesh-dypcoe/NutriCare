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
    CircularProgress,
    Alert
} from '@mui/material';
import api from '../../services/api';

const DeliveryHistory = () => {
    const [state, setState] = useState({
        history: [],
        loading: true,
        error: null
    });

    const fetchHistory = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            
            // Fetch delivery history
            const response = await api.get('/delivery/history');
            console.log('Delivery History:', response.data);

            setState(prev => ({
                ...prev,
                history: response.data || [],
                loading: false
            }));
        } catch (error) {
            console.error('Error fetching history:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load delivery history'
            }));
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (state.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (state.error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {state.error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Delivery History
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient Name</TableCell>
                            <TableCell>Room Number</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Delivery Time</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.history.length > 0 ? (
                            state.history.map((delivery) => (
                                <TableRow key={delivery._id}>
                                    <TableCell>{delivery.patientName}</TableCell>
                                    <TableCell>{delivery.roomNumber}</TableCell>
                                    <TableCell>{delivery.mealType}</TableCell>
                                    <TableCell>
                                        {new Date(delivery.deliveryTime).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{delivery.notes || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No delivery history found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DeliveryHistory; 