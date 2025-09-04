import Loading from './Loading';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { Container, Typography, Paper, Box } from '@mui/material';
import { doc, getDoc, getDocs, collection, runTransaction } from 'firebase/firestore';

function SecretFriend() {
    const [user, setUser] = useState(null);
    const { width, height } = useWindowSize();
    const [winner, setWinner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = auth?.currentUser;
                if (!currentUser) return;

                const userDoc = await getDoc(doc(db, 'users', currentUser?.uid));
                const currentUserData = { ...userDoc?.data(), id: currentUser?.uid };
                setUser(currentUserData);

                if (currentUserData?.amigoSecreto) {
                    setWinner(currentUserData.amigoSecreto);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            };
        };
        fetchUser();
    }, []);

    const spin = async () => {
        if (!user || spinning) return;
      
        setSpinning(true);
        setWinner(null);
      
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user?.id);
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) throw 'User not found!';
        
                const allUsersSnap = await getDocs(collection(db, 'users'));
                const allUsers = allUsersSnap?.docs?.map(d => ({ ...d?.data(), id: d?.id }));
        
                const assignedIds = allUsers
                    ?.filter(u => u?.amigoSecreto?.id)
                    ?.map(u => u?.amigoSecreto?.id);
        
                const possibleReceivers = allUsers.filter(
                    u => u?.id !== user?.id && !assignedIds.includes(u?.id)
                );
        
                if (possibleReceivers?.length === 0) {
                    throw 'No hay usuarios disponibles';
                };
        
                const receiver = possibleReceivers[Math?.floor(Math?.random() * possibleReceivers?.length)];
        
                transaction.update(userRef, {
                    amigoSecreto: { 
                        id: receiver?.id,
                        name: receiver?.name,
                        photoBase64: receiver?.photoBase64 || null
                    },
                    hasSpun: true,
                });
            });
      
            const updatedUserDoc = await getDoc(doc(db, 'users', user?.id));
            setUser({ ...updatedUserDoc?.data(), id: user?.id });
            setWinner(updatedUserDoc?.data()?.amigoSecreto);
        } catch (e) {
            console.error('Error en la transacción: ', e);
            alert('Ups, alguien ya tomó esa persona. Intenta de nuevo.');
        } finally {
            setSpinning(false);
        };
    };

    if (loading) return <Loading/>;

    return (
        <Container
            maxWidth='lg'
            sx={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 4, md: 6 },
            }}
        >
            <Paper
                component={motion.div}
                animate={{ scale: 1, opacity: 1 }}
                initial={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundSize: '600% 600%',
                    backgroundOrigin: 'border-box',
                    borderRadius: { xs: 0, sm: 4 },
                    border: '3px solid transparent',
                    p: { xs: 3, sm: 5, md: 8, lg: 10 },
                    backgroundClip: 'padding-box, border-box',
                    animation: 'gradientShift 12s ease infinite',
                    '@keyframes gradientShift': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                    },
                    minHeight: { xs: '60vh', sm: '50vh', md: '60vh' }, 
                    boxShadow: { xs: 'none', sm: '0 8px 25px rgba(0,0,0,0.3)' },
                    maxWidth: { xs: '100%', sm: 600, md: 900, lg: 1100, xl: 1400 },
                    backgroundImage: 'linear-gradient(270deg, #0f8ece, #d80e77, #0045C4), linear-gradient(90deg, #00c6ff, #ff0080)',
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant='h4'
                        sx={{
                            color: '#fff',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                        }}
                    >
                        {`¡Hola, ${user?.name?.trim()}!`}
                    </Typography>
                    {!winner && (
                        <Typography
                            variant='h6'
                            sx={{
                                mt: 2,
                                mx: 'auto',
                                maxWidth: 600,
                                color: '#f0f0f0',
                            }}
                        >
                            Presiona el botón para girar y descubrir quién te tocó 🎁.  
                            ¡Recuerda que solo tienes una oportunidad para revelar tu amigo secreto!
                        </Typography>
                    )}
                    <Typography
                        variant='h5'
                        component={motion.div}
                        textTransform='uppercase'
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        initial={{ y: -30, opacity: 0 }}
                        sx={{ fontWeight: 'bold', color: '#fff', mt: 2 }}
                    >
                        {!winner ? '¡Adivina tu amigo secreto!' : 'Tu amigo secreto es'}
                    </Typography>
                </Box>
                {!winner && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SpinButton spinning={spinning} onClick={spin}/>
                    </Box>
                )}
                {winner && (
                    <>
                        <Confetti recycle={false} numberOfPieces={250} width={width} height={height} />
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    mt: 4,
                                    borderRadius: 4,
                                    textAlign: 'center',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                                    background: 'linear-gradient(60deg,rgb(69, 154, 113),rgb(80, 150, 248))',
                                }}
                            >
                                <Typography
                                    variant='h5'
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {`🎉 ${winner?.name} 🎉`}
                                </Typography>
                                {winner?.photoBase64 && (
                                    <Box
                                        component='img'
                                        alt={winner.name}
                                        src={winner.photoBase64}
                                        sx={{
                                            mt: 2,
                                            boxShadow: 3,
                                            objectFit: 'cover',
                                            borderRadius: '10%',
                                            border: '4px solid white',
                                            width: { xs: 100, sm: 120, md: 150 },
                                            height: { xs: 130, sm: 160, md: 200 },
                                        }}
                                    />
                                )}
                            </Box>
                        </motion.div>
                    </>
                )}
            </Paper>
        </Container>
    );      
};

function SpinButton({ spinning, onClick }) {

    const SIZE = 80;

    return (
        <Box
            sx={{
                width: SIZE,
                height: SIZE,
                position: 'relative',
                alignItems: 'center',
                display: 'inline-flex',
                justifyContent: 'center',
            }}
        >
            {spinning && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{
                        width: SIZE,
                        height: SIZE,
                        borderRadius: '50%',
                        position: 'absolute',
                        boxSizing: 'border-box',
                        border: '6px solid #1976d2',
                        borderTop: '6px solid #ff0080',
                    }}
                />
            )}
            <motion.button
                onClick={onClick}
                disabled={spinning}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.1 }}
                style={{
                    width: SIZE,
                    height: SIZE,
                    color: '#fff',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(90deg, #0045C4, #1565c0)',
                }}
            >
                {spinning ? '...' : 'GO'}
            </motion.button>
        </Box>
    );
};

export default SecretFriend;

                {/* {user?.role === 'admin' && !winner && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            sx={{
                                px: 6,
                                py: 1.5,
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease',
                                '&:active': { transform: 'scale(0.97)' },
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                background: 'linear-gradient(90deg, #0045C4, #1565c0)',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    background: 'linear-gradient(90deg, #1565c0, #0045C4)',
                                },
                            }}
                            onClick={assignSecretFriends}
                        >
                            {`Repartir automáticamente`}
                        </Button>
                    </Box>
                )} */}