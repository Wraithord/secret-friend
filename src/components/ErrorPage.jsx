import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';

function ErrorPage({ message }) {
    return (
        <Container maxWidth='sm' sx={{ mt: 10 }}>
            <Paper sx={{ p: 5, textAlign: 'center' }} elevation={8} component={motion.div} animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                <Typography variant='h4' sx={{ mb: 3, fontWeight: 'bold' }}>
                    {message || 'Ocurrió un problema'}
                </Typography>
                <Box>
                    <Button component={Link} to='/register' variant='contained' color='primary'>
                        Ir a Registro / Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ErrorPage;