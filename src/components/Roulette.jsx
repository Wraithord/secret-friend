import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, getDocs, updateDoc, collection } from 'firebase/firestore';
import { Container, Typography, Paper, Button, Box, CircularProgress } from '@mui/material';
import Loading from './Loading';

function Roulette() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [winner, setWinner] = useState(null);
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const currentUser = auth?.currentUser;
                if (!currentUser) return;

                const userDoc = await getDoc(doc(db, 'users', currentUser?.uid));
                setUser({ ...userDoc.data(), id: currentUser?.uid });

                const usersSnapshot = await getDocs(collection(db, 'users'));
                setUsers(usersSnapshot.docs?.map(d => ({ ...d.data(), id: d?.id })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            };
        };
        fetchUsers();
    }, []);

    const spin = async () => {
        if (!user || spinning) return;

        const possibleReceivers = users.filter(u =>
            u?.id !== user?.id &&
            u?.name &&
            !users.some(g => g?.amigoSecreto?.id === u?.id)
        );

        if (possibleReceivers?.length === 0) {
            alert('No hay usuarios disponibles para asignar.');
            return;
        };

        setSpinning(true);
        setWinner(null);

        const receiver = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)];
        await new Promise(res => setTimeout(res, 3000));

        await updateDoc(doc(db, 'users', user?.id), {
            amigoSecreto: { id: receiver?.id, name: receiver?.name },
            hasSpun: true,
        });

        setUser(prev => ({ ...prev, hasSpun: true, amigoSecreto: receiver }));
        setWinner(receiver);
        setSpinning(false);
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
            }}>
            <Paper sx={{ p: 10, borderRadius: 3, background: 'linear-gradient(135deg, #f8b400, #f85c50)' }}>
                <Typography 
                    variant='h4' 
                    gutterBottom
                    textTransform='uppercase'
                    component={motion.div}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    initial={{ y: -30, opacity: 0 }}
                    sx={{ fontWeight: 'bold', color: '#fff', mb: 4 }}
                >
                    {`¡Adivina tu amigo secreto!`}
                </Typography>
                {!winner && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Button
                            onClick={spin}
                            color='primary'
                            variant='contained'
                            disabled={spinning}
                            sx={{ px: 5, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
                        >
                            {spinning ? 'Buscando...' : 'Buscar'}
                        </Button>
                        {spinning && <CircularProgress color="inherit" />}
                    </Box>
                )}
                {winner && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                        <Box sx={{ mt: 3, p: 3, backgroundColor: '#fff', borderRadius: 2 }}>
                            <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#f85c50' }}>
                                🎉 ¡Tu amigo secreto es: {winner.name}! 🎉
                            </Typography>
                        </Box>
                    </motion.div>
                )}
            </Paper>
        </Container>
    );
}

export default Roulette;
