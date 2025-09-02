import Loading from './Loading';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, getDocs, updateDoc, collection } from 'firebase/firestore';
import { Container, Typography, Paper, Button, Box, CircularProgress } from '@mui/material';

function SecretFriend() {
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
                const currentUserData = { ...userDoc?.data(), id: currentUser?.uid };
                setUser(currentUserData);

                if (currentUserData?.amigoSecreto) {
                    setWinner(currentUserData.amigoSecreto);
                };

                const usersSnapshot = await getDocs(collection(db, 'users'));
                setUsers(usersSnapshot.docs?.map(d => ({ ...d?.data(), id: d?.id })));
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

        if (user?.amigoSecreto) {
            setWinner(user?.amigoSecreto);
            return;
        };

        const assignedIds = users
            ?.filter(u => u?.amigoSecreto?.id)
            ?.map(u => u?.amigoSecreto?.id);

        const possibleReceivers = users.filter(u =>
            u?.id !== user?.id &&
            u?.name &&
            !assignedIds?.includes(u?.id)
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
            amigoSecreto: { 
                id: receiver?.id, 
                name: receiver?.name, 
            },
            hasSpun: true,
        });

        setUser(prev => ({ 
            ...prev,
            hasSpun: true, 
            amigoSecreto: receiver,
        }));
        setWinner(receiver);
        setSpinning(false);
    };

    const assignSecretFriends = async () => {
        if (!user || user?.role !== 'admin') {
            alert('No tienes permisos para realizar esta acción');
            return;
        };
    
        const shuffled = [...users];
    
        for (let i = shuffled?.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    
        const receivers = [...shuffled?.slice(1), shuffled[0]];
    
        const updates = shuffled?.map((u, idx) => ({
            giver: u,
            receiver: receivers[idx],
        }));
    
        const idsReceivers = new Set(updates?.map(u => u?.receiver?.id));
        if (idsReceivers?.size !== users?.length) {
            console.error("❌ Algo salió mal, hay repetidos");
            alert("Error en la asignación, intenta de nuevo");
            return;
        };
    
        try {
            const batchUpdates = updates?.map(({ giver, receiver }) =>
                updateDoc(doc(db, 'users', giver?.id), {
                    hasSpun: true,
                    amigoSecreto: {
                        id: receiver?.id,
                        name: receiver?.name,
                    },
                })
            );
    
            await Promise.all(batchUpdates);
            console.log('✅ Amigos secretos asignados');
            updates.forEach(({ giver, receiver }) => {
                console.log(`${giver?.name} → ${receiver?.name}`);
            });            
        } catch (err) {
            console.error(err);
            alert("❌ Error al asignar amigos secretos");
        };
    };

    if (loading) return <Loading/>;

    return (
        <Container maxWidth='lg' sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 10, borderRadius: 3, background: 'linear-gradient(135deg, #f8b400, #f85c50)' }}>
                <Typography 
                    variant='h4'
                    gutterBottom
                    component={motion.div}
                    textTransform='uppercase'
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    initial={{ y: -30, opacity: 0 }}
                    sx={{ fontWeight: 'bold', color: '#fff', mb: 4, textAlign: 'center' }}
                >
                    {!winner ? '¡Adivina tu amigo secreto!' : 'Tu amigo secreto es'}
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
                        {spinning && <CircularProgress color='inherit'/>}
                    </Box>
                )}
                {winner && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant='h3' sx={{ fontWeight: 'bold', color: '#fff' }}>
                                {`🎉 ${winner?.name} 🎉`}
                            </Typography>
                        </Box>
                    </motion.div>
                )}
                {user?.role === 'admin' && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={assignSecretFriends}
                            sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
                        >
                            Repartir automáticamente
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}

export default SecretFriend;
