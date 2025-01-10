import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    People as PeopleIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import PantryStaffList from './PantryStaffList';
import TaskAssignmentOverview from './TaskAssignmentOverview';
import api from '../../services/api';

const PantryManagement = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            console.log('Fetching staff...'); // Debug log
            const response = await api.get('/manager/staff');
            console.log('Staff response:', response.data); // Debug log
            setStaff(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching staff:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError('Failed to load staff members');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Pantry Management
            </Typography>
            
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab 
                        icon={<PeopleIcon />} 
                        label="Staff Management" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<AssignmentIcon />} 
                        label="Task Assignments" 
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            <Box sx={{ mt: 2 }}>
                {activeTab === 0 && <PantryStaffList staff={staff} onStaffUpdate={fetchStaff} />}
                {activeTab === 1 && <TaskAssignmentOverview staff={staff} />}
            </Box>
        </Box>
    );
};

export default PantryManagement; 