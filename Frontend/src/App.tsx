import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Sidebar from './components/Layout/Sidebar';
import { Box, LinearProgress, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

// Lazy imports
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

const EmployeeList = lazy(() => import('./pages/Admin/EmployeeList'));

function RouteFallback() {
    return <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />;
}

function AppLayout() {
    const { user, logout } = useAuth();
    const { i18n } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // State për gjuhën - mund ta lidhësh me i18n më vonë

    

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLangChange = (lang: string) => {
        i18n.changeLanguage(lang.toLowerCase());
        // Këtu mund të shtosh login për ndërrim gjuhe reale: i18n.changeLanguage(lang.toLowerCase())
       
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
            
            {/* Sidebar - Merr vlerën 'open' për t'u fshehur/shfaqur */}
            {user && <Sidebar open={isSidebarOpen} />}

            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: '#121212',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease' // Tranzicion i lëmuar për çdo ndryshim
                }}
            >
                {/* NAVBAR I SIPËRM (Vetëm kur user është logged in) */}
                {user && (
                    <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        bgcolor: '#121212'
                    }}>
                        {/* Butoni Hamburger majtas */}
                        <IconButton 
                            onClick={toggleSidebar} 
                            sx={{ 
                                color: 'white', 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Grupi djathtas: Gjuhët dhe Logout */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            
                            {/* Kutia e Gjuhëve */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 0.5, 
                                bgcolor: 'rgba(255,255,255,0.05)', 
                                p: 0.5, 
                                borderRadius: 1.5 
                            }}>
                                {['SQ', 'EN', 'DE'].map((lang) => (
                                    <Button 
                                        key={lang} 
                                        size="small" 
                                        onClick={() => handleLangChange(lang)}
                                        sx={{ 
                                           color: i18n.language.toUpperCase().includes(lang) ? '#1976d2' : '#9ca3af', 
                                  bgcolor: i18n.language.toUpperCase().includes(lang) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                fontWeight: 'bold',
                                  fontSize: '12px' }}
                                    >
                                        {lang}
                                    </Button>
                                ))}
                            </Box>

                            {/* Butoni Abmelden */}
                            <Button 
                                variant="contained" 
                                color="error" 
                                size="small"
                                startIcon={<LogoutIcon />}
                                onClick={() => logout()} // Thirrja e funksionit nga AuthContext
                                sx={{ 
                                    borderRadius: 1.5, 
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    px: 2,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none', bgcolor: '#d32f2f' }
                                }}
                            >
                              {t('nav.logout')}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Zona ku ngarkohen faqet (Përmbajtja Dinamike) */}
                <Suspense fallback={<RouteFallback />}>
                    <Box sx={{ p: 3, flexGrow: 1 }}>
                        <Routes>
                            {/* Rrugët Publike */}
                            <Route element={<GuestRoute />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                            </Route>

                            {/* Rrugët e Mbrojtura */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/profile" element={<Profile />} />
                            </Route>

                            {/* Rrugët Admin */}
                            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                                <Route path="/admin/users" element={<UserManagement />} />
                                <Route path="/admin/employees" element={<EmployeeList />} />
                            </Route>

                            {/* Redirects */}
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </Box>
                </Suspense>
            </Box>
        </Box>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppLayout />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;