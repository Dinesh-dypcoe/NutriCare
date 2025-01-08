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
    TextField,
    Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const DeliveryHistory = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        fetchDeliveryHistory();
    }, [startDate, endDate]);

    const fetchDeliveryHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/delivery/history';
            
            if (startDate && endDate) {
                url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching delivery history:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Delivery History
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={startDate}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Delivery Time</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveries.map((delivery) => (
                            <TableRow key={delivery._id}>
                                <TableCell>{delivery.patientName}</TableCell>
                                <TableCell>{delivery.roomNumber}</TableCell>
                                <TableCell>{delivery.mealType}</TableCell>
                                <TableCell>
                                    {new Date(delivery.deliveryTime).toLocaleString()}
                                </TableCell>
                                <TableCell>{delivery.notes || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {deliveries.length === 0 && (
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