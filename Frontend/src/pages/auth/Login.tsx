import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { mapUserResponseToAuth } from '../../utils/mapAuthPayload';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const formatLoginError = (err: unknown): string => {
        const ax = err as { response?: { data?: unknown } };
        const data = ax.response?.data;
        if (typeof data === 'string') return data;
        if (data && typeof data === 'object' && 'message' in data) {
            const m = (data as { message?: unknown }).message;
            if (typeof m === 'string') return m;
        }
        return t('login.errorInvalid');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const session = mapUserResponseToAuth(response.data);
            login(session);

            const isAdmin = session.user.roles.includes('Admin');
            navigate(isAdmin ? '/admin/users' : '/profile');
        } catch (err: unknown) {
            const errorMsg = formatLoginError(err);
            // Kontrollojmë mesazhin që vjen nga backend-i për ta përkthyer
            if (errorMsg.includes("incorrect") || errorMsg.includes("invalid")) {
                setError(t('login.errorInvalid'));
            } else {
                setError(errorMsg);
            }
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#121212', // Sfondi i zi
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Butoni i gjuhëve i pozicionuar fiks lart-djathtas */}
            <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
            </Box>

            <Container maxWidth="xs">
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.03)', // Glassmorphism i lehtë
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                        {t('nav.SystemName')}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        {t('login.title')}
                    </Typography>

                    {error && (
                        <Alert severity="error" variant="filled" sx={{ mb: 2, width: '100%', borderRadius: 1.5 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label={t('login.email')}
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label={t('login.password')}
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }
                            }}
                        />
                        
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            sx={{ 
                                mt: 4, 
                                py: 1.5,
                                borderRadius: 2, 
                                textTransform: 'none', 
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)',
                                '&:hover': { boxShadow: 'none' }
                            }}
                        >
                            {t('login.submit')}
                        </Button>

                        <Button 
                            fullWidth 
                            variant="text" 
                            sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }} 
                            onClick={() => navigate('/register')}
                        >
                            {t('login.noAccount')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;