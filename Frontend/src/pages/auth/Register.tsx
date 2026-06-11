import { useReducer, useState } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Alert,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Paper,
    FormHelperText,
    type SelectChangeEvent,
} from '@mui/material';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguagePopover } from '../../components/Layout/LanguagePopover';
import axios from 'axios';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gjinia: string;
};

type FormAction = { type: 'SET'; field: keyof FormState; value: string };

const initialForm: FormState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gjinia: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
}

const Register = () => {
    const { t } = useTranslation();
    const [formData, dispatchForm] = useReducer(formReducer, initialForm);
    const [globalError, setGlobalError] = useState('');
    const navigate = useNavigate();

    // Ruajmë vetëm emrin e thjeshtë të çelësit që gjendet brenda "register.errors" te JSON
    const [errorKeys, setErrorKeys] = useState<Record<keyof FormState | 'global', string>>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gjinia: '',
        global: ''
    });

    const validateForm = (): boolean => {
        const newErrors = { firstName: '', lastName: '', email: '', password: '', gjinia: '', global: '' };
        let isValid = true;

        // 1. Validimi për FirstName
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'firstName'; 
            isValid = false;
        } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
            newErrors.firstName = 'firstNameLength';
            isValid = false;
        }

        // 2. Validimi për LastName
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'lastName';
            isValid = false;
        } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
            newErrors.lastName = 'lastNameLength';
            isValid = false;
        }

        // 3. Validimi për Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'emailRequired';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'emailInvalid';
            isValid = false;
        }

        // 4. Validimi për Gjinia
        if (!formData.gjinia) {
            newErrors.gjinia = 'gender';
            isValid = false;
        }

        // 5. Validimi për Password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        if (!formData.password) {
            newErrors.password = 'passwordRequired';
            isValid = false;
        } else if (formData.password.length < 6 || formData.password.length > 100) {
            newErrors.password = 'passwordTooShort';
            isValid = false;
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'passwordStrength';
            isValid = false;
        }

        setErrorKeys(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError('');
        
        if (!validateForm()) return;

        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const serverData = err.response.data;
                
                if (serverData.errors) {
                    const backendErrors: any = {};
                    Object.keys(serverData.errors).forEach((key) => {
                        const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                        // Nëse gabimi vjen nga backend, e shfaqim si mesazh të gatshëm direkt
                        backendErrors[fieldName] = serverData.errors[key][0];
                    });
                    setErrorKeys((prev) => ({ ...prev, ...backendErrors }));
                } else if (typeof serverData === 'string') {
                    setGlobalError(serverData);
                } else if (serverData.message) {
                    setGlobalError(serverData.message);
                }
            } else {
                setGlobalError(t('register.errorFailed'));
            }
        }
    };

    const handleInputChange = (field: keyof FormState, value: string) => {
        dispatchForm({ type: 'SET', field, value });
        if (errorKeys[field]) {
            setErrorKeys(prev => ({ ...prev, [field]: '' }));
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: 'text.primary',
            borderRadius: 2,
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { color: 'text.secondary' },
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'center',
            bgcolor: 'background.default',
            position: 'relative',
            py: 5 
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
                        {t('register.title')}
                    </Typography>

                    {globalError && (
                        <Alert severity="error" variant="filled" sx={{ mb: 2, width: '100%', borderRadius: 1.5 }}>
                            {globalError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }} noValidate>
                        <TextField
                            fullWidth
                            label={t('register.firstName')}
                            margin="normal"
                            value={formData.firstName}
                            error={!!errorKeys.firstName}
                            helperText={errorKeys.firstName ? (errorKeys.firstName.includes(' ') ? errorKeys.firstName : t(`register.errors.${errorKeys.firstName}`)) : ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            sx={inputStyles}
                        />
                        
                        <TextField
                            fullWidth
                            label={t('register.lastName')}
                            margin="normal"
                            value={formData.lastName}
                            error={!!errorKeys.lastName}
                            helperText={errorKeys.lastName ? (errorKeys.lastName.includes(' ') ? errorKeys.lastName : t(`register.errors.${errorKeys.lastName}`)) : ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            sx={inputStyles}
                        />
                        
                        <TextField
                            fullWidth
                            label={t('register.email')}
                            margin="normal"
                            type="email"
                            value={formData.email}
                            error={!!errorKeys.email}
                            helperText={errorKeys.email ? (errorKeys.email.includes(' ') ? errorKeys.email : t(`register.errors.${errorKeys.email}`)) : ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            sx={inputStyles}
                        />
                        
                        <FormControl fullWidth margin="normal" error={!!errorKeys.gjinia} sx={inputStyles}>
                            <InputLabel id="gjinia-label">{t('register.gender')}</InputLabel>
                            <Select
                                labelId="gjinia-label"
                                label={t('register.gender')}
                                value={formData.gjinia}
                                onChange={(e: SelectChangeEvent) => handleInputChange('gjinia', e.target.value)}
                                sx={(theme) => ({ borderRadius: 2, color: theme.palette.text.primary })}
                            >
                                <MenuItem value="" disabled>
                                    <em>{t('register.gender')}</em>
                                </MenuItem>
                                <MenuItem value="M">{t('register.genderM')}</MenuItem>
                                <MenuItem value="F">{t('register.genderF')}</MenuItem>
                            </Select>
                            {errorKeys.gjinia && (
                                <FormHelperText sx={{ mx: 2 }}>
                                    {errorKeys.gjinia.includes(' ') ? errorKeys.gjinia : t(`register.errors.${errorKeys.gjinia}`)}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            label={t('register.password')}
                            type="password"
                            margin="normal"
                            value={formData.password}
                            error={!!errorKeys.password}
                            helperText={errorKeys.password ? (errorKeys.password.includes(' ') ? errorKeys.password : t(`register.errors.${errorKeys.password}`)) : t('register.passwordHelper')}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            sx={inputStyles}
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
                                boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)'
                            }}
                        >
                            {t('register.submit')}
                        </Button>
                        
                        <Button 
                            fullWidth 
                            variant="text" 
                            sx={(theme) => ({ mt: 2, color: theme.palette.text.secondary, textTransform: 'none' })} 
                            onClick={() => navigate('/login')}
                        >
                            {t('register.haveAccount')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;