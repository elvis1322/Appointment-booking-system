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
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.05)', // Sfondi i zi/gri i hapur
        p: '4px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
      }}
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
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: isActive ? '0px 4px 10px rgba(25, 118, 210, 0.3)' : 'none',

                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
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