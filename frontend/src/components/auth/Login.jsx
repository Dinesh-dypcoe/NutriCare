import { useState } from 'react';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Container,
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
    CssBaseline
} from '@mui/material';
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    LocalHospital
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VerminVibesFont from '../../assets/VerminVibesV-Zlg3.ttf';

const Login = () => {
    const theme = useTheme();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.user.role);
                
                switch(response.data.user.role) {
                    case 'manager': navigate('/manager/dashboard'); break;
                    case 'pantry': navigate('/pantry/dashboard'); break;
                    case 'delivery': navigate('/delivery/dashboard'); break;
                    default: navigate('/');
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    backgroundImage: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.dark, 0.8)} 0%, 
                        ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
                }}
            >
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={24}
                            sx={{
                                p: 4,
                                borderRadius: 2,
                                backdropFilter: 'blur(20px)',
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                            }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <LocalHospital 
                                    sx={{ 
                                        fontSize: 40,
                                        color: theme.palette.primary.main,
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h4" component="h1" gutterBottom fontFamily={'VerminVibes'} color={theme.palette.primary.main}>
                                    Welcome to Nutricare
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Sign in to continue
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Email"
                                    variant="outlined"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {error && (
                                    <Typography color="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Typography>
                                )}

                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Sign In
                                </Button>

                                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" align="center" gutterBottom>
                                        Test Credentials
                                    </Typography>
                                    <Typography variant="body2" align="center">
                                        Manager: hospital_manager@xyz.com<br />
                                        Pantry: hospital_pantry@xyz.com<br />
                                        Delivery: hospital_delivery@xyz.com<br />
                                        Password: Password@2025
                                    </Typography>
                                </Box>
                            </form>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>
        </>
    );
};

export default Login; 