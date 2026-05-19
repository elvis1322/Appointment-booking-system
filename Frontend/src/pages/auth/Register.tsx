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
    type SelectChangeEvent,
} from '@mui/material';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';



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
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const formatRegisterError = (err: unknown): string => {
        const ax = err as { response?: { data?: unknown } };
        const data = ax.response?.data;
        if (typeof data === 'string') return data;
        if (data && typeof data === 'object') {
            const rec = data as Record<string, unknown>;
            if (typeof rec.message === 'string') return rec.message;
        }
        return t('register.errorFailed');
    };
    const [genderError, setGenderError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGenderError(false);
       const missingFields: string[] = [];

    if (!formData.firstName.trim()) missingFields.push(t('register.firstName'));
    if (!formData.lastName.trim()) missingFields.push(t('register.lastName'));
    if (!formData.email.trim()) missingFields.push(t('register.email'));
    if (!formData.gjinia) missingFields.push(t('register.gender'));
    if (!formData.password.trim()) missingFields.push(t('register.password'));

    // 2. Kontrollojmë nëse ka fusha bosh
    if (missingFields.length > 0) {
        // Bashkojmë emrat e fushave me presje
        const fieldsText = missingFields.join(', ');
        
        // Kriojmë mesazhin e plotë: "Fushat vijuese janë të detyrueshme: Emri, Mbiemri..."
        setError(`${t('register.errors.requiredPrefix')}: ${fieldsText}`);
        return;
    }

 

    if (formData.password.length < 6) {
        setError(t('register.errors.passwordTooShort'));
        return;
    }
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err: unknown) {
            setError(formatRegisterError(err));
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: 'white',
            borderRadius: 2,
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
        '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.4)' }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#121212',
            position: 'relative',
            py: 5 // Hapësirë shtesë për scroll në mobile
        }}>
            {/* Language Selector lart djathtas */}
            <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
            </Box>

            <Container maxWidth="xs">
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                        {t('register.title')}
                    </Typography>

                    {error && (
                        <Alert severity="error" variant="filled" sx={{ mb: 2, width: '100%', borderRadius: 1.5 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label={t('register.firstName')}
                            margin="normal"
                            value={formData.firstName}
                            onChange={(e) => dispatchForm({ type: 'SET', field: 'firstName', value: e.target.value })}
                            sx={inputStyles}
                        />
                        <TextField
                            fullWidth
                            label={t('register.lastName')}
                            margin="normal"
                            value={formData.lastName}
                            onChange={(e) => dispatchForm({ type: 'SET', field: 'lastName', value: e.target.value })}
                            sx={inputStyles}
                        />
                        <TextField
                            fullWidth
                            label={t('register.email')}
                            margin="normal"
                            type="email"
                            value={formData.email}
                            onChange={(e) => dispatchForm({ type: 'SET', field: 'email', value: e.target.value })}
                            sx={inputStyles}
                        />
                        
                        <FormControl fullWidth margin="normal" sx={inputStyles}>
                            <InputLabel id="gjinia-label">{t('register.gender')}</InputLabel>
                            <Select
                                labelId="gjinia-label"
                                label={t('register.gender')}
                                value={formData.gjinia}
                                onChange={(e: SelectChangeEvent) =>{
                                    setGenderError(false);
                                    dispatchForm({ type: 'SET', field: 'gjinia', value: e.target.value })
                                }}
                                sx={{ borderRadius: 2, color: 'white' }}
                            displayEmpty
                            >
                                <MenuItem value="" disabled>
                               <em>{t('register.gender')}</em></MenuItem>
                                <MenuItem value="M">{t('register.genderM')}</MenuItem>
                                <MenuItem value="F">{t('register.genderF')}</MenuItem>
                            </Select>
                            {genderError && (
                                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                    {t('register.errorGenderRequired') || t('register.selectGenderPlaceholder')}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            label={t('register.password')}
                            type="password"
                            margin="normal"
                            value={formData.password}
                            onChange={(e) => dispatchForm({ type: 'SET', field: 'password', value: e.target.value })}
                            helperText={t('register.passwordHelper')}
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
                            sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }} 
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