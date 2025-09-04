import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Paper, Button, Stack } from '@mui/material';
import { PersonAdd, Casino, CardGiftcard, AdminPanelSettings } from '@mui/icons-material';

function Home({ currentUser }) {

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role || 'user');
                };
            };
        };
        fetchRole();
    }, [currentUser]);

    return (
        <Container
            maxWidth='lg'
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                px: { xs: 2, sm: 4 },
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    borderRadius: 4,
                    textAlign: 'center',
                    p: { xs: 3, sm: 5, md: 8 },
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    maxWidth: { xs: '90%', sm: 500 },
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                }}
                component={motion.div}
                animate={{ scale: 1, opacity: 1 }}
                initial={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Box animate={{ scale: 1 }} component={motion.div} initial={{ scale: 0.9 }} sx={{ mb: { xs: 2, md: 3 } }} transition={{ duration: 0.6 }}>
                    <Typography 
                        color='#000' 
                        align='center' 
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }}}
                    >
                        {`Encuentra tu amigo secreto`}
                    </Typography>
                </Box>
                <Typography
                    color='#000'
                    align='center'
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    sx={{ mb: { xs: 2, md: 4 }, fontSize: { xs: '1rem', sm: '1.2rem', md: '1.25rem' }}}
                >
                    {`Presiona el botón y adivina quién es tu amigo secreto. ¡Comparte con tus compañeros!`}
                </Typography>
                <Stack spacing={2} sx={{ mb: { xs: 3, md: 4 } }}>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
                        <PersonAdd sx={{ color: '#0090C4' }} fontSize='large'/>
                        <Typography variant='body1' color='#000'>
                            {`Paso 1: Inicia sesión`}
                        </Typography>
                        </Stack>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
                        <Casino sx={{ color: '#0090C4' }} fontSize='large'/>
                        <Typography variant='body1' color='#000'>
                            {`Paso 2: Buscar y descubre tu amigo secreto`}
                        </Typography>
                        </Stack>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
                        <CardGiftcard sx={{ color: '#0090C4' }} fontSize='large'/>
                        <Typography variant='body1' color='#000'>
                            {`Paso 3: Disfruta y sorprende con tu regalo`}
                        </Typography>
                        </Stack>
                    </Box>
                </Stack>
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!currentUser ? (
                        <Button
                            size='large'
                            to='/register'
                            color='primary'
                            component={Link}
                            variant='contained'
                            sx={{ py: 1.5, fontWeight: 'bold', px: { xs: 3, md: 5 }, ':hover': { color: '#000' }}}
                        >
                            {'Iniciar sesión'}
                        </Button>
                    ) : (
                        <>
                            <Button
                                size='large'
                                color='primary'
                                component={Link}
                                to='/secretFriend'
                                variant='contained'
                                sx={{ py: 1.5, fontWeight: 'bold', px: { xs: 3, md: 5 }, ':hover': { color: '#fff' }}}
                            >
                                {'Amigo secreto'}
                            </Button>
                            {userRole === 'admin' && (
                                <Button
                                    to='/admin'
                                    size='large'
                                    component={Link}
                                    variant='contained'
                                    startIcon={<AdminPanelSettings/>}
                                    sx={{ 
                                        mt: 2, 
                                        py: 1.5,
                                        fontWeight: 'bold', 
                                        px: { xs: 3, md: 5 }, 
                                        backgroundColor: '#B50E71', ':hover': { color: '#000', backgroundColor: '#8F0A59' },
                                    }}
                                >
                                    {'Administración'}
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Home;