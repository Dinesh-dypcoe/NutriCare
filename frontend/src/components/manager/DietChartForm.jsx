import { useState, useEffect } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid,
    MenuItem,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Alert
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { dietChartAPI, patientAPI } from '../../services/api';

const DietChartForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        patientId: '',
        meals: [
            {
                type: 'breakfast',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: '08:00'
            },
            {
                type: 'lunch',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: '13:00'
            },
            {
                type: 'dinner',
                items: [{ name: '', quantity: '', instructions: '' }],
                specialInstructions: [''],
                timing: '19:00'
            }
        ],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        specialDietaryRequirements: [''],
        status: 'active'
    });

    useEffect(() => {
        fetchPatients();
        if (id) {
            fetchDietChart();
        }
    }, [id]);

    const fetchPatients = async () => {
        try {
            const response = await patientAPI.getAll();
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to load patients');
        }
    };

    const fetchDietChart = async () => {
        try {
            const response = await dietChartAPI.getById(id);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching diet chart:', error);
            setError('Failed to load diet chart');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await dietChartAPI.update(id, formData);
            } else {
                await dietChartAPI.create(formData);
            }
            navigate('/manager/diet-charts');
        } catch (error) {
            console.error('Error saving diet chart:', error);
            setError('Failed to save diet chart');
        } finally {
            setLoading(false);
        }
    };

    const handleMealItemChange = (mealIndex, itemIndex, field, value) => {
        const updatedMeals = [...formData.meals];
        updatedMeals[mealIndex].items[itemIndex][field] = value;
        setFormData({ ...formData, meals: updatedMeals });
    };

    const handleAddMealItem = (mealIndex) => {
        const updatedMeals = [...formData.meals];
        updatedMeals[mealIndex].items.push({ name: '', quantity: '', instructions: '' });
        setFormData({ ...formData, meals: updatedMeals });
    };

    const handleRemoveMealItem = (mealIndex, itemIndex) => {
        const updatedMeals = [...formData.meals];
        updatedMeals[mealIndex].items.splice(itemIndex, 1);
        setFormData({ ...formData, meals: updatedMeals });
    };

    const handleArrayFieldAdd = (field, mealIndex = null) => {
        if (mealIndex !== null) {
            const updatedMeals = [...formData.meals];
            updatedMeals[mealIndex].specialInstructions.push('');
            setFormData({ ...formData, meals: updatedMeals });
        } else {
            setFormData({
                ...formData,
                [field]: [...formData[field], '']
            });
        }
    };

    const handleArrayFieldRemove = (field, index, mealIndex = null) => {
        if (mealIndex !== null) {
            const updatedMeals = [...formData.meals];
            updatedMeals[mealIndex].specialInstructions.splice(index, 1);
            setFormData({ ...formData, meals: updatedMeals });
        } else {
            setFormData({
                ...formData,
                [field]: formData[field].filter((_, i) => i !== index)
            });
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Edit Diet Chart' : 'Create New Diet Chart'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Patient</InputLabel>
                            <Select
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                label="Patient"
                            >
                                {patients.map((patient) => (
                                    <MenuItem key={patient._id} value={patient._id}>
                                        {patient.name} - Room {patient.roomNumber}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {formData.meals.map((meal, mealIndex) => (
                        <Grid item xs={12} key={mealIndex}>
                            <Typography variant="subtitle1" gutterBottom>
                                {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} Menu
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Timing"
                                        type="time"
                                        value={meal.timing}
                                        onChange={(e) => {
                                            const updatedMeals = [...formData.meals];
                                            updatedMeals[mealIndex].timing = e.target.value;
                                            setFormData({ ...formData, meals: updatedMeals });
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {meal.items.map((item, itemIndex) => (
                                        <Box key={itemIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <TextField
                                                label="Item Name"
                                                value={item.name}
                                                onChange={(e) => handleMealItemChange(mealIndex, itemIndex, 'name', e.target.value)}
                                                required
                                            />
                                            <TextField
                                                label="Quantity"
                                                value={item.quantity}
                                                onChange={(e) => handleMealItemChange(mealIndex, itemIndex, 'quantity', e.target.value)}
                                                required
                                            />
                                            <TextField
                                                label="Instructions"
                                                value={item.instructions}
                                                onChange={(e) => handleMealItemChange(mealIndex, itemIndex, 'instructions', e.target.value)}
                                                fullWidth
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveMealItem(mealIndex, itemIndex)}
                                                disabled={meal.items.length === 1}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddMealItem(mealIndex)}
                                        sx={{ mt: 1 }}
                                    >
                                        Add Item
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Special Dietary Requirements
                        </Typography>
                        {formData.specialDietaryRequirements.map((req, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    value={req}
                                    onChange={(e) => {
                                        const updated = [...formData.specialDietaryRequirements];
                                        updated[index] = e.target.value;
                                        setFormData({ ...formData, specialDietaryRequirements: updated });
                                    }}
                                    placeholder="Enter requirement"
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleArrayFieldRemove('specialDietaryRequirements', index)}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => handleArrayFieldAdd('specialDietaryRequirements')}
                            sx={{ mt: 1 }}
                        >
                            Add Requirement
                        </Button>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/manager/diet-charts')}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (id ? 'Update' : 'Create')}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default DietChartForm; 