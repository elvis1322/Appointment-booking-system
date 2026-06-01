import { List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react'; 

interface NavItem {
  title: string;
  path: string;
  icon: string;
}

export default function NavSection({ data }: { data: NavItem[] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <List sx={{ px: 1 }}>
      {data.map((item) => {
        const active = pathname === item.path;

        return (
          <ListItemButton
            key={item.title}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: active ? 'primary.main' : 'text.secondary',
              backgroundColor: active ? 'primary.lighter' : 'transparent',
              fontWeight: active ? 'fontWeightBold' : 'fontWeightMedium',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Icon icon={item.icon} width={24} />
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        );
      })}
    </List>
  );
}