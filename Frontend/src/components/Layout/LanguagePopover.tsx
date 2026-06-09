import { useTranslation } from 'react-i18next';
import { Button, Stack, Box } from '@mui/material';

export function LanguagePopover() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'sq', label: 'SQ' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
  ];

    return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'background.paper',
        p: '4px',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
      })}
    >
      <Stack direction="row" spacing={0.5}>
        {languages.map((lang) => {
          // Kontrollojmë nëse kjo është gjuha aktive
          const isActive = i18n.language.startsWith(lang.code);

          return (
            <Button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              size="small"
              sx={{
                minWidth: 45,
                height: 30,
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '8px',
                textTransform: 'none',
                transition: 'all 0.2s ease',

                // Ngjyrat dinamike
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : (theme: any) => theme.palette.text.secondary,
                boxShadow: isActive ? '0px 4px 10px rgba(25, 118, 210, 0.3)' : 'none',

                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : (theme: any) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                },
              }}
            >
              {lang.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}