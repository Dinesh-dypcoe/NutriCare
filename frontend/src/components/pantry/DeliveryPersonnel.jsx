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
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const DeliveryPersonnel = () => {
    const [personnel, setPersonnel] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: ''
    });

    useEffect(() => {
        fetchPersonnel();
    }, []);

    const fetchPersonnel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/delivery-personnel', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPersonnel(response.data);
        } catch (error) {
            console.error('Error fetching delivery personnel:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (selectedPerson) {
                await axios.put(
                    `http://localhost:5000/api/pantry/delivery-personnel/${selectedPerson._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
            } else {
                await axios.post(
                    'http://localhost:5000/api/pantry/delivery-personnel',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
            }
            fetchPersonnel();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving delivery personnel:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this person?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/pantry/delivery-personnel/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchPersonnel();
            } catch (error) {
                console.error('Error deleting delivery personnel:', error);
            }
        }
    };

    const handleOpenDialog = (person = null) => {
        if (person) {
            setSelectedPerson(person);
            setFormData({
                name: person.name,
                contactNumber: person.contactNumber,
                email: person.email
            });
        } else {
            setSelectedPerson(null);
            setFormData({
                name: '',
                contactNumber: '',
                email: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedPerson(null);
        setFormData({
            name: '',
            contactNumber: '',
            email: ''
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                    Delivery Personnel
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact Number</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Active Deliveries</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personnel.map((person) => (
                            <TableRow key={person._id}>
                                <TableCell>{person.name}</TableCell>
                                <TableCell>{person.contactNumber}</TableCell>
                                <TableCell>{person.email}</TableCell>
                                <TableCell>{person.activeDeliveries || 0}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(person)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(person._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedPerson ? 'Edit Delivery Personnel' : 'Add New Delivery Personnel'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Contact Number"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            margin="normal"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {selectedPerson ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default DeliveryPersonnel; 