import React, { useState, useEffect } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid,
    MenuItem,
    Chip,
    IconButton,
    Divider
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const PatientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        diseases: [''],
        allergies: [''],
        roomNumber: '',
        bedNumber: '',
        floorNumber: '',
        age: '',
        gender: '',
        contactNumber: '',
        emergencyContact: {
            name: '',
            relationship: '',
            contactNumber: ''
        },
        status: 'admitted'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchPatient();
        }
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await api.getById(id);
            setFormData(response.data);
        } catch (error) {
            setError('Failed to fetch patient details');
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await api.put(`/manager/patients/${id}`, formData);
            } else {
                await api.post('/manager/patients', formData);
            }
            navigate('/manager/patients');
        } catch (error) {
            console.error('Error saving patient:', error);
        }
    };

    const handleArrayFieldAdd = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleArrayFieldRemove = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Edit Patient' : 'Add New Patient'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            required
                        >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Contact Number"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Room Number"
                            value={formData.roomNumber}
                            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Bed Number"
                            value={formData.bedNumber}
                            onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Floor Number"
                            value={formData.floorNumber}
                            onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Diseases
                        </Typography>
                        {formData.diseases.map((disease, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    value={disease}
                                    onChange={(e) => handleArrayFieldChange('diseases', index, e.target.value)}
                                    placeholder="Enter disease"
                                />
                                <IconButton 
                                    color="error" 
                                    onClick={() => handleArrayFieldRemove('diseases', index)}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => handleArrayFieldAdd('diseases')}
                            sx={{ mt: 1 }}
                        >
                            Add Disease
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Allergies
                        </Typography>
                        {formData.allergies.map((allergy, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    value={allergy}
                                    onChange={(e) => handleArrayFieldChange('allergies', index, e.target.value)}
                                    placeholder="Enter allergy"
                                />
                                <IconButton 
                                    color="error" 
                                    onClick={() => handleArrayFieldRemove('allergies', index)}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => handleArrayFieldAdd('allergies')}
                            sx={{ mt: 1 }}
                        >
                            Add Allergy
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Emergency Contact
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={formData.emergencyContact.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergencyContact: {
                                            ...formData.emergencyContact,
                                            name: e.target.value
                                        }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Relationship"
                                    value={formData.emergencyContact.relationship}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergencyContact: {
                                            ...formData.emergencyContact,
                                            relationship: e.target.value
                                        }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    value={formData.emergencyContact.contactNumber}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergencyContact: {
                                            ...formData.emergencyContact,
                                            contactNumber: e.target.value
                                        }
                                    })}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/manager/patients')}
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

export default PatientForm; 