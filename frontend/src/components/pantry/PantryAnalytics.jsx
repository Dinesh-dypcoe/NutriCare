import { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    useTheme,
    Button
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';

const PantryAnalytics = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        preparationMetrics: {
            totalTasks: 0,
            completedTasks: 0,
            averagePreparationTime: 0,
            delayedTasks: 0
        },
        mealTypeDistribution: [],
        statusDistribution: [],
        deliveriesPerDay: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const formattedData = response.data.deliveriesPerDay.map(item => ({
                date: format(new Date(item.date), 'MMM dd'),
                count: item.count
            }));

            setAnalytics({
                ...response.data,
                deliveriesPerDay: formattedData
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const exportToCSV = () => {
        const csvData = [
            ['Date', 'Total Tasks', 'Completed', 'Pending', 'Preparing'],
            ...analytics.deliveriesPerDay.map(day => [
                day.date,
                analytics.preparationMetrics.totalTasks,
                analytics.preparationMetrics.completedTasks,
                analytics.preparationMetrics.pendingTasks,
                analytics.preparationMetrics.preparingTasks
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pantry-analytics.csv';
        a.click();
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
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportToCSV}
                >
                    Export Report
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Total Tasks Card */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Tasks Today
                            </Typography>
                            <Typography variant="h4">
                                {analytics.preparationMetrics.totalTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Tasks Card */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="warning.main">
                                Pending Tasks
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {analytics.preparationMetrics.pendingTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Preparing Tasks Card */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="info.main">
                                Preparing
                            </Typography>
                            <Typography variant="h4" color="info.main">
                                {analytics.preparationMetrics.preparingTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completed Tasks Card */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="success.main">
                                Completed Tasks
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {analytics.preparationMetrics.completedTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Meal Type Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.mealTypeDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {analytics.mealTypeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Preparation Status Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.statusDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Deliveries Per Day
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.deliveriesPerDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        name="Deliveries"
                                        stroke="#8884d8" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default PantryAnalytics; 