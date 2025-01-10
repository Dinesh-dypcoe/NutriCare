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
    Alert,
    Autocomplete
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
    const [patientSearchInput, setPatientSearchInput] = useState('');
    const [patientLoading, setPatientLoading] = useState(false);

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
            
            // Format the dates to YYYY-MM-DD format for the input fields
            const formattedData = {
                ...response.data,
                startDate: new Date(response.data.startDate).toISOString().split('T')[0],
                endDate: new Date(response.data.endDate).toISOString().split('T')[0],
                patientId: response.data.patientId._id || response.data.patientId, // Handle both populated and unpopulated cases
                meals: response.data.meals.map(meal => ({
                    ...meal,
                    items: meal.items.length > 0 ? meal.items : [{ name: '', quantity: '', instructions: '' }],
                    specialInstructions: meal.specialInstructions.length > 0 ? meal.specialInstructions : ['']
                }))
            };

            console.log('Fetched diet chart data:', formattedData);
            setFormData(formattedData);
        } catch (error) {
            console.error('Error fetching diet chart:', error);
            setError('Failed to load diet chart');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate meals have required fields
            const validMeals = formData.meals.every(meal => 
                meal.type && 
                meal.timing && 
                meal.items && 
                meal.items.length > 0 &&
                meal.items.every(item => item.name)
            );

            if (!validMeals) {
                setError('Please fill in all required meal information');
                setLoading(false);
                return;
            }

            console.log('Submitting diet chart:', formData);

            if (id) {
                await dietChartAPI.update(id, formData);
            } else {
                await dietChartAPI.create(formData);
            }
            
            navigate('/manager/diet-charts');
        } catch (error) {
            console.error('Error saving diet chart:', error);
            setError(error.response?.data?.message || 'Failed to save diet chart');
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
            <Typography variant="h6" sx={{ mb: 3 }}>
                {id ? 'Edit Diet Chart' : 'Create New Diet Chart'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Autocomplete
                            value={patients.find(p => p._id === formData.patientId) || null}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    patientId: newValue?._id || ''
                                }));
                            }}
                            inputValue={patientSearchInput}
                            onInputChange={(event, newInputValue) => {
                                setPatientSearchInput(newInputValue);
                            }}
                            options={patients}
                            getOptionLabel={(option) => 
                                `${option.name} (Room: ${option.roomNumber})`
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Patient"
                                    required
                                    error={Boolean(error && !formData.patientId)}
                                    helperText={error && !formData.patientId ? "Patient is required" : ""}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {patientLoading ? (
                                                    <CircularProgress color="inherit" size={20} />
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box>
                                        <Typography variant="body1">
                                            {option.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Room: {option.roomNumber} | Age: {option.age} | Gender: {option.gender}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            loading={patientLoading}
                            filterOptions={(options, { inputValue }) => {
                                const searchTerm = inputValue.toLowerCase();
                                return options.filter(option => 
                                    option.name.toLowerCase().includes(searchTerm) ||
                                    option.roomNumber.toLowerCase().includes(searchTerm)
                                );
                            }}
                        />
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