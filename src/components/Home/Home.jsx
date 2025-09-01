import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { homeStyles } from './homeStyles.jsx';
import { PersonAdd, Casino, CardGiftcard, AdminPanelSettings } from '@mui/icons-material';
import { Container, Typography, Box, Paper, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';

function Home({ currentUser }) {

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role || 'user');
                }
            }
        };
        fetchRole();
    }, [currentUser]);

    return (
        <Container maxWidth='md' sx={homeStyles.container}>
            <Paper
                elevation={8}
                component={motion.div}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                initial={{ opacity: 0, y: 50 }}
                sx={{ ...homeStyles.paper, padding: 5, borderRadius: 4 }}
            >
                <Box sx={{ mb: 3 }} animate={{ scale: 1 }} component={motion.div} initial={{ scale: 0.9 }} transition={{ duration: 0.6 }}>
                    <Typography variant='h4' align='center' sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {`Encuentra tu amigo secreto`}
                    </Typography>
                </Box>

                <Typography
                    variant='h6'
                    align='center'
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={{ mb: 4, color: 'text.secondary' }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    {`Presiona el botón y adivina quién es tu amigo secreto. ¡Diviértete con tus compañeros!`}
                </Typography>

                <Stack spacing={3} sx={{ mb: 4 }}>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <PersonAdd color='primary' fontSize='large'/>
                            <Typography variant='body1'>
                                {`Paso 1: Regístrate o inicia sesión`}
                            </Typography>
                        </Stack>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <Casino color='secondary' fontSize='large'/>
                            <Typography variant='body1'>
                                {`Paso 2: Buscar y descubrir tu amigo secreto`}
                            </Typography>
                        </Stack>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <CardGiftcard color='success' fontSize='large'/>
                            <Typography variant='body1'>
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
                            sx={{ px: 5, py: 1.5, fontWeight: 'bold', ':hover': { color: '#fff' } }}
                        >
                            {'Registrarse / Iniciar sesión'}
                        </Button>
                    ) : (
                        <>
                            <Button
                                size='large'
                                color='primary'
                                component={Link}
                                to='/secretFriend'
                                variant='contained'
                                sx={{ px: 5, py: 1.5, fontWeight: 'bold', ':hover': { color: '#fff' } }}
                            >
                                {'Amigo secreto'}
                            </Button>

                            {userRole === 'admin' && (
                                <Button
                                    size='large'
                                    color='secondary'
                                    component={Link}
                                    to='/admin'
                                    startIcon={<AdminPanelSettings/>}
                                    variant='contained'
                                    sx={{ px: 5, py: 1.5, fontWeight: 'bold', mt: 2 }}
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