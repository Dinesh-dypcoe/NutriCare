import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    MenuItem,
    IconButton,
    Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DietChartForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patientId: '',
        startDate: '',
        endDate: '',
        meals: [
            {
                type: 'breakfast',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: ''
            },
            {
                type: 'lunch',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: ''
            },
            {
                type: 'dinner',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: ''
            }
        ],
        specialDietaryRequirements: ['']
    });

    useEffect(() => {
        fetchPatients();
        if (id) {
            fetchDietChart();
        }
    }, [id]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchDietChart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/diet-charts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching diet chart:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (id) {
                await axios.put(`http://localhost:5000/api/diet-charts/${id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/diet-charts', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate('/manager/diet-charts');
        } catch (error) {
            console.error('Error saving diet chart:', error);
        }
    };

    const handleMealItemChange = (mealIndex, itemIndex, field, value) => {
        const newMeals = [...formData.meals];
        newMeals[mealIndex].items[itemIndex][field] = value;
        setFormData({ ...formData, meals: newMeals });
    };

    const addMealItem = (mealIndex) => {
        const newMeals = [...formData.meals];
        newMeals[mealIndex].items.push({ name: '', quantity: '', instructions: '' });
        setFormData({ ...formData, meals: newMeals });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Edit Diet Chart' : 'Create New Diet Chart'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Patient"
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            required
                        >
                            {patients.map((patient) => (
                                <MenuItem key={patient._id} value={patient._id}>
                                    {patient.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    {/* Add more form fields for meals and dietary requirements */}
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/manager/diet-charts')}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                    >
                        {id ? 'Update' : 'Create'} Diet Chart
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default DietChartForm; 