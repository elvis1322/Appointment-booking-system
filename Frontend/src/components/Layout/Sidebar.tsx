import { Box, Drawer, Typography, Avatar, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next'; 

const NAV_WIDTH = 280;

interface SidebarUser {
    firstName: string;
    lastName: string;
    roles: string[];
    photoURL?: string;
}

// 1. Shto interface për prop-in 'open'
interface SidebarProps {
    open: boolean;
}

export default function Sidebar({ open }: SidebarProps) { // 2. Merr prop-in këtu
    const { user } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation();

    if (!user) return null;

    const authUser = user as unknown as SidebarUser;
   // const isAdmin = authUser.roles.includes('Admin');
const isAdmin = authUser?.roles?.includes('Admin') ?? false;
    const navConfig = [
        { title: t('nav.profile'), path: '/profile', icon: 'solar:user-bold-duotone' },
        ...(isAdmin ? [{ title: t('nav.users'), path: '/admin/users', icon: 'solar:users-group-rounded-bold-duotone' }] : []),
    ];

    return (
        <Box sx={{
            width: open ? NAV_WIDTH : 0, // 3. Gjerësia varet nga 'open'
            flexShrink: 0,
            transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }}>
            <Drawer
                variant="persistent" // 4. Ndryshoje në persistent
                anchor="left"
                open={open} // 5. Lidhja direkte me toggle
                slotProps={{
                    paper: {
                        sx: {
                            width: NAV_WIDTH,
                            bgcolor: 'background.default',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                        },
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2.5, py: 3, gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {t('nav.SystemName')}
                    </Typography>
                </Box>

                {/* USER CARD */}
                <Box sx={{ mb: 5, mx: 2.5, px: 2, py: 1.5, borderRadius: 2, bgcolor: 'rgba(145, 158, 171, 0.12)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={authUser.photoURL} alt={authUser.firstName} />
                    <Box sx={{ opacity: open ? 1 : 0 }}> {/* Fsheh tekstin nëse mbyllet */}
                        <Typography variant="subtitle2" noWrap>{authUser.firstName} {authUser.lastName}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{authUser.roles[0]}</Typography>
                    </Box>
                </Box>

                {/* MENU LIST */}
                <List sx={{ px: 1 }}>
                    {navConfig.map((item) => {
                        const active = pathname === item.path;
                        return (
                            <ListItemButton
                                key={item.title}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    color: active ? 'primary.main' : 'text.secondary',
                                    bgcolor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                    <Icon icon={item.icon} width={24} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.title} 
                                    slotProps={{ primary: { variant: 'body2', sx: { fontWeight: active ? 'bold' : 'medium' } } }} 
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>
        </Box>
    );
}