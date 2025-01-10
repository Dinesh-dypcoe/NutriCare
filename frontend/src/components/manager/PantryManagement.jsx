import { useState } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    Divider
} from '@mui/material';
import {
    People as PeopleIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import PantryStaffList from './PantryStaffList';
import TaskAssignmentOverview from './TaskAssignmentOverview';

const PantryManagement = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

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
                {activeTab === 0 && <PantryStaffList />}
                {activeTab === 1 && <TaskAssignmentOverview />}
            </Box>
        </Box>
    );
};

export default PantryManagement; 