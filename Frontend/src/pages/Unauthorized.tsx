import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const home =
        user?.roles.includes('Admin') === true ? '/admin/users' : user ? '/profile' : '/login';

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Nuk ke leje për këtë faqe
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Kërkohet rol tjetër ose leje shtesë nga administratori.
                </Typography>
                <Button variant="contained" onClick={() => navigate(home)}>
                    Kthehu në faqen kryesore
                </Button>
            </Box>
        </Container>
    );
};

export default Unauthorized;
