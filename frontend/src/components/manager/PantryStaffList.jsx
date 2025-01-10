import { useState } from 'react';
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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../services/api';

const PantryStaffList = ({ staff, onStaffUpdate }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        role: 'pantry'
    });

    const handleDelete = async (id) => {
        try {
            await api.delete(`/manager/pantry-staff/${id}`);
            onStaffUpdate();
        } catch (error) {
            setError('Failed to delete staff member');
        }
    };

    // ... rest of your component code

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
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Current Task</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staff.map((member) => (
                            <TableRow key={member._id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell>
                                    {member.currentTask ? (
                                        <Chip 
                                            label={member.currentTask} 
                                            color={member.currentTask === 'cooking' ? 'warning' : 'info'}
                                        />
                                    ) : (
                                        <Chip label="Available" color="success" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(member)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(member._id)} color="error">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PantryStaffList; 