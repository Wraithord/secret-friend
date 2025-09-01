import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loading({ text = 'Cargando...' }) {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            <CircularProgress size={60} color='secondary'/>
            <Typography variant='h6' sx={{ mt: 2 }}>
                {text}
            </Typography>
        </Box>
    );
}