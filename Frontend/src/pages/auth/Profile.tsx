import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    Typography, Button, Box, Paper, Avatar, 
    Grid, TextField, CircularProgress, Alert, Snackbar,
    MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosConfig';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import LockResetIcon from '@mui/icons-material/LockReset';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ msg: string; sev: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        gjinia: '' 
    });
    const [passwordData, setPasswordData] = useState({ 
        oldPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [formErrors, setFormErrors] = useState({ firstName: false, lastName: false, gjinia: false });

    // --- FUNKSIONI REFETCH (Identik me Admin Dashboard) ---
    const fetchProfileData = useCallback(async () => {
        try {
            const response = await api.get('/User/GetME');
            if (response.status === 200 && updateUser) {
                updateUser({ ...user, ...response.data } as any);
                
                setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    email: response.data.email || '',
                    gjinia: response.data.gjinia || '',
                });
            }
        } catch (error) {
            console.error('Gabim gjatë refetch të profilit:', error);
        }
    }, [updateUser, user]);

    // Thirrja fillestare
    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSaveProfile = async () => {
        const errors = {
            firstName: !formData.firstName.trim(),
            lastName: !formData.lastName.trim(),
            gjinia: !formData.gjinia
        };

        setFormErrors(errors);
        if (Object.values(errors).some(isError => isError)) {
            setSnackbar({ msg: t('profile.fillRequiredFields'), sev: 'error' });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                gjinia: formData.gjinia
            };

            const response = await api.put('/User/UpdateME', dataToSend);

            if (response.status === 200) {
                setSnackbar({ msg: t('profile.updateSuccess'), sev: 'success' });
                setIsEditing(false);
                await fetchProfileData();
            }
        } catch (error) {
            setSnackbar({ msg: t('profile.updateError'), sev: 'error' });
            console.error(t('profile.updateError'), error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setSnackbar({ msg: t('profile.passwordMismatch'), sev: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/User/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
                confirmNewPassword: passwordData.confirmPassword
            });

            if (response.status === 200) {
                setSnackbar({ msg: t('profile.passwordSuccess'), sev: 'success' });
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setIsChangingPassword(false);
                await fetchProfileData();
            }
        } catch (error: unknown) {
            let errorMsg = t('profile.unexpectedError');
            if (axios.isAxiosError(error)) {
                const serverData = error.response?.data;
                if (typeof serverData === 'string') errorMsg = serverData;
                else if (serverData?.errors) {
                    const firstErrorField = Object.keys(serverData.errors)[0];
                    errorMsg = serverData.errors[firstErrorField][0];
                }
            }
            setSnackbar({ msg: String(errorMsg), sev: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Stili që dëgjon plotësisht sistemin e të dhënave të Theme-s suaj
    const cardStyle = {
        p: { xs: 3, md: 4 }, 
        borderRadius: '16px', 
        boxShadow: (theme: any) => theme.shadows[1] || '0px 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',         // Përdor kufirin e paracaktuar të temës
        backgroundColor: 'background.paper', // Përshtatet me Light/Dark mode automatikisht
        color: 'text.primary'
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, width: '100%', maxWidth: '1200px', margin: '0 auto', backgroundColor: 'background.default', color: 'text.primary' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                {t('profile.title')}
            </Typography>

            <Grid container spacing={4}>
                {/* Header-i i Profilit */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ ...cardStyle, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Avatar sx={{ 
                            width: 100, 
                            height: 100, 
                            backgroundColor: 'primary.main', // Merr ngjyrën kryesore nga tema juaj
                            color: 'primary.contrastText', // Teksti merr kontrastin e duhur bazuar mbi ngjyrën kryesore
                            fontSize: '2.5rem', 
                            fontWeight: 'bold',
                            border: '4px solid',
                            borderColor: 'background.paper'
                        }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>{user?.firstName} {user?.lastName}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', mb: 0.5, color: 'primary.main' }}>
                                {user?.roles?.[0] || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Prishtina, Kosovo</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Seksioni i të Dhënave Personale */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={cardStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{t('profile.personalInfo')}</Typography>
                            {!isEditing ? (
                                <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                    {t('profile.edit')}
                                </Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button variant="contained" color="success" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} onClick={handleSaveProfile} disabled={loading} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                        {t('profile.save') || 'Ruaj'}
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                        {t('profile.cancel') || 'Anulo'}
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.firstName')}</Typography>
                                {isEditing ? (
                                    <TextField fullWidth size="small" variant="outlined" value={formData.firstName} error={formErrors.firstName} helperText={formErrors.firstName ? t('users.table.firstNamex') : ''} onChange={(e) => { setFormData({...formData, firstName: e.target.value}); setFormErrors({...formErrors, firstName: false}); }} />
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 500, p: '8px 0', color: 'text.primary' }}>{user?.firstName || '---'}</Typography>
                                )}
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.lastName')}</Typography>
                                {isEditing ? (
                                    <TextField fullWidth size="small" variant="outlined" value={formData.lastName} error={formErrors.lastName} helperText={formErrors.lastName ? t('users.table.lastNamex') : ''} onChange={(e) => { setFormData({...formData, lastName: e.target.value}); setFormErrors({...formErrors, lastName: false}); }} />
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 500, p: '8px 0', color: 'text.primary' }}>{user?.lastName || '---'}</Typography>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.email')}</Typography>
                                <TextField fullWidth size="small" variant="outlined" value={user?.email || ''} disabled sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'action.hover' } }} />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('register.gender')}</Typography>
                                {isEditing ? (
                                    <TextField select fullWidth size="small" variant="outlined" value={formData.gjinia} error={formErrors.gjinia} helperText={formErrors.gjinia ? t('users.table.genderx') : ''} onChange={(e) => { setFormData({...formData, gjinia: e.target.value}); setFormErrors({...formErrors, gjinia: false}); }}>
                                        <MenuItem value="M">{t('register.genderM')}</MenuItem>
                                        <MenuItem value="F">{t('register.genderF')}</MenuItem>
                                    </TextField>
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 500, p: '8px 0', color: 'text.primary' }}>
                                        {user?.gjinia === 'M' ? t('register.genderM') : user?.gjinia === 'F' ? t('register.genderF') : '---'}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Seksioni i Ndryshimit të Fjalëkalimit */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={cardStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isChangingPassword ? 4 : 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <LockResetIcon color="primary" sx={{ fontSize: '1.8rem' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{t('profile.changePassword')}</Typography>
                            </Box>
                            {!isChangingPassword && (
                                <Button variant="outlined" color="primary" onClick={() => setIsChangingPassword(true)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                    {t('profile.editPassword')}
                                </Button>
                            )}
                        </Box>

                        {isChangingPassword && (
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.oldPassword')}</Typography>
                                    <TextField fullWidth size="small" type="password" placeholder="••••••••" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.newPassword')}</Typography>
                                    <TextField fullWidth size="small" type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{t('profile.confirmPassword')}</Typography>
                                    <TextField fullWidth size="small" type="password" placeholder="••••••••" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, mt: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Button variant="contained" color="success" onClick={handleChangePassword} disabled={loading} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                        {t('profile.save')}
                                    </Button>
                                    <Button variant="text" color="error" onClick={() => setIsChangingPassword(false)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                        {t('profile.cancel')}
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}>
                <Alert severity={snackbar?.sev || 'info'} variant="filled" sx={{ width: '100%', borderRadius: '8px' }}>{snackbar?.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;