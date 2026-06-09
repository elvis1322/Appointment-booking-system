import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 
const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation(); 

    if (!user) {
        return null;
    }

    const isAdmin = user.roles.includes('Admin');
    const displayName =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;

    const goHome = () => {
        navigate(isAdmin ? '/admin/users' : '/profile');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <AppBar position="static" sx={{ mb: 2, backgroundColor: '#1976d2' }}>
            <Container maxWidth="lg"
  >
                <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap', width: '100%' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={goHome}
                    >
                        {isAdmin ? t('nav.adminPanel') : t('nav.profile')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {isAdmin && (
                            <Button color="inherit" onClick={() => navigate('/admin/users')}>
                                {t('nav.users')}
                            </Button>
                        )}
                        <Button color="inherit" onClick={() => navigate('/profile')}>
                            {t('nav.profile')}
                        </Button>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', px: 1 }}>
                            {displayName}
                        </Typography>
                        <Button variant="contained" color="error" size="small" onClick={handleLogout}>
                            {t('nav.logout')}
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
