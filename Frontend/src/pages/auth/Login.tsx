import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { mapUserResponseToAuth } from '../../utils/mapAuthPayload';
import { useTranslation } from 'react-i18next';
import { LanguagePopover } from '../../components/Layout/LanguagePopover';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Tani ruajmë vetëm "kodin" e gabimit dhe jo fjalitë e gatshme string
    const [errorCode, setErrorCode] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // Ky funksion tani thjesht klasifikon llojin e gabimit që vjen nga backend
    const parseErrorCode = (err: unknown): string => {
        const ax = err as { response?: { data?: unknown } };
        const data = ax.response?.data;
        
        if (typeof data === 'string') {
            if (data.toLowerCase().includes("incorrect") || data.toLowerCase().includes("invalid")) {
                return 'invalidCredentials';
            }
            return data; // Kthen mesazhin e backend-it si string nëse s'është kredinciale e gabuar
        }
        
        if (data && typeof data === 'object' && 'message' in data) {
            const m = (data as { message?: unknown }).message;
            if (typeof m === 'string') {
                if (m.toLowerCase().includes("incorrect") || m.toLowerCase().includes("invalid")) {
                    return 'invalidCredentials';
                }
                return m;
            }
        }
        
        return 'invalidCredentials';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorCode('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const session = mapUserResponseToAuth(response.data);
            login(session);

            const isAdmin = session.user.roles.includes('Admin');
            navigate(isAdmin ? '/admin/users' : '/profile');
        } catch (err: unknown) {
            const code = parseErrorCode(err);
            setErrorCode(code);
        }
    };

    // Funksion i vogël që i kthen gabimet dinamike në bazë të gjuhës aktive
    const renderErrorMessage = () => {
        if (!errorCode) return '';
        
        if (errorCode === 'invalidCredentials') {
            return t('login.errorInvalid');
        }
        
        // Nëse është një string specifik nga backend që nuk është përkthyer lokalish
        return errorCode;
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                <LanguagePopover />
            </Box>

            <Container maxWidth="xs">
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(10px)'
                }}>
                    
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                        {t('nav.SystemName')}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        {t('login.title')}
                    </Typography>

                    {/* Thirret funksioni i përkthimit dinamik në kohë reale */}
                    {errorCode && (
                        <Alert severity="error" variant="filled" sx={{ mb: 2, width: '100%', borderRadius: 1.5 }}>
                            {renderErrorMessage()}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label={t('login.email')}
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={(theme) => ({
                                '& .MuiOutlinedInput-root': {
                                    color: theme.palette.text.primary,
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: theme.palette.divider },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: theme.palette.text.secondary }
                            })}
                        />
                        <TextField
                            fullWidth
                            label={t('login.password')}
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={(theme) => ({
                                '& .MuiOutlinedInput-root': {
                                    color: theme.palette.text.primary,
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: theme.palette.divider },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: theme.palette.text.secondary }
                            })}
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
                            sx={(theme) => ({ mt: 2, color: theme.palette.text.secondary, textTransform: 'none' })} 
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