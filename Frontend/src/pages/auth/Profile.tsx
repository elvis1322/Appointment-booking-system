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
            // Mund të vendosësh setLoading(true) këtu nëse dëshiron loading spinner gjatë refetch
            const response = await api.get('/User/GetME');
            if (response.status === 200 && updateUser) {
                // Përditësojmë Context-in
                updateUser({ ...user, ...response.data } as any);
                
                // Përditësojmë Formën me të dhënat e fundit nga DB
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
                
                // PAS SUKSESIT -> REFETCH
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
                
                // Edhe këtu mund të bësh refetch nëse backend ndryshon diçka në user state pas password change
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

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>{t('profile.title')}</Typography>

            <Grid container spacing={3}>
                <Grid size={12}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
                        <Avatar sx={{ width: 90, height: 90, bgcolor: 'primary.main', fontSize: '2.2rem', fontWeight: 'bold' }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{user?.firstName} {user?.lastName}</Typography>
                            <Typography variant="body1" color="text.secondary">{user?.roles?.[0] || 'User'}</Typography>
                            <Typography variant="caption" color="text.disabled">Prishtina, Kosovo</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('profile.personalInfo')}</Typography>
                            {!isEditing ? (
                                <Button variant="contained" color="warning" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                                    {t('profile.edit')}
                                </Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="success" onClick={handleSaveProfile} disabled={loading}>
                                        {loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                                    </Button>
                                    <Button variant="outlined" color="error" onClick={() => setIsEditing(false)}><CancelIcon /></Button>
                                </Box>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>{t('profile.firstName')}</Typography>
                                {isEditing ? <TextField fullWidth size="small" variant="standard" value={formData.firstName} error={formErrors.firstName} helperText={formErrors.firstName ? t('users.table.firstNamex') : ''} onChange={(e) => { setFormData({...formData, firstName: e.target.value}); setFormErrors({...formErrors, firstName: false}); }} /> : <Typography variant="body1">{user?.firstName}</Typography>}
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>{t('profile.lastName')}</Typography>
                                {isEditing ? <TextField fullWidth size="small" variant="standard" value={formData.lastName} error={formErrors.lastName} helperText={formErrors.lastName ? t('users.table.lastNamex') : ''} onChange={(e) => { setFormData({...formData, lastName: e.target.value}); setFormErrors({...formErrors, lastName: false}); }} /> : <Typography variant="body1">{user?.lastName}</Typography>}
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>{t('profile.email')}</Typography>
                                <Typography variant="body1">{user?.email}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>{t('register.gender')}</Typography>
                                {isEditing ? (
                                    <TextField select fullWidth size="small" variant="standard" value={formData.gjinia} error={formErrors.gjinia} helperText={formErrors.gjinia ? t('users.table.genderx') : ''} onChange={(e) => { setFormData({...formData, gjinia: e.target.value}); setFormErrors({...formErrors, gjinia: false}); }}>
                                        <MenuItem value="M">{t('register.genderM')}</MenuItem>
                                        <MenuItem value="F">{t('register.genderF')}</MenuItem>
                                    </TextField>
                                ) : (
                                    <Typography variant="body1">{user?.gjinia === 'M' ? t('register.genderM') : user?.gjinia === 'F' ? t('register.genderF') : '---'}</Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={12}>
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LockResetIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('profile.changePassword')}</Typography>
                            </Box>
                            {!isChangingPassword && (
                                <Button variant="outlined" onClick={() => setIsChangingPassword(true)}>{t('profile.editPassword')}</Button>
                            )}
                        </Box>

                        {isChangingPassword && (
                            <Grid container spacing={2}>
                                <Grid  size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth type="password" label={t('profile.oldPassword')} value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth type="password" label={t('profile.newPassword')} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth type="password" label={t('profile.confirmPassword')} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button variant="contained" color="success" onClick={handleChangePassword} disabled={loading}>{t('profile.save')}</Button>
                                    <Button variant="text" color="error" onClick={() => setIsChangingPassword(false)}>{t('profile.cancel')}</Button>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}>
                <Alert severity={snackbar?.sev || 'info'} sx={{ width: '100%' }}>{snackbar?.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;