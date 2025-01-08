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
    IconButton,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import { Edit, Delete, Add, Search as SearchIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await patientAPI.getAll();
            console.log('Fetched patients:', response.data); // Debug log
            setPatients(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to load patients. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            try {
                await patientAPI.delete(id);
                fetchPatients();
            } catch (error) {
                console.error('Error deleting patient:', error);
                setError('Failed to delete patient. Please try again.');
            }
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.roomNumber.includes(searchTerm)
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">
                    Patient Management
                </Typography>
                <Button
                    component={Link}
                    to="/manager/patients/new"
                    variant="contained"
                    startIcon={<Add />}
                >
                    Add New Patient
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Search patients..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Room Number</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Contact Number</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <TableRow key={patient._id}>
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.roomNumber}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.gender}</TableCell>
                                    <TableCell>{patient.contactNumber}</TableCell>
                                    <TableCell>{patient.status}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            component={Link}
                                            to={`/manager/patients/edit/${patient._id}`}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(patient._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        No patients found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PatientList; 