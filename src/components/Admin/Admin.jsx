import Loading from '../Loading';
import { db } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Container, Paper, Typography, Stack, TextField, Button, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

function Admin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setFetching(true);
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(allUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleCreateUser = async () => {
        if (!name.trim() || !email.trim()) return alert('Nombre y correo son requeridos');
        setLoading(true);

        try {
            await addDoc(collection(db, 'users'), {
                name,
                email,
                role: 'user',
                hasSpun: false,
                amigoSecreto: null,
                createdAt: new Date(),
            });

            setName('');
            setEmail('');
            fetchUsers();
            alert('Usuario creado correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Loading />;

    return (
        <Container maxWidth='md' sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant='h4' align='center' sx={{ mb: 4, fontWeight: 'bold' }}>
                    Panel de Administración
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label='Nombre completo'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label='Correo electrónico'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleCreateUser}
                        disabled={loading}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Creando...' : 'Crear usuario'}
                    </Button>
                </Stack>

                <Divider sx={{ mb: 4 }} />
                <Typography variant='h5' sx={{ mb: 2, fontWeight: 'bold' }}>
                    {`Usuarios existentes`}
                </Typography>
                <UsersTable users={users}/>
            </Paper>
        </Container>
    );
};

function UsersTable({ users }) {
    const sortedUsers = users?.slice()?.sort((a, b) => {
        if (!a?.name) return 1;
        if (!b?.name) return -1;
        return a?.name?.localeCompare(b?.name);
    });

    const handleResetSecret = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                amigoSecreto: null,
                hasSpun: false,
            });
            alert('Amigo secreto borrado correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al borrar amigo secreto');
        };
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Correo</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedUsers?.map((u, index) => (
                        <TableRow key={u?.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{u?.name}</TableCell>
                            <TableCell>{u?.email}</TableCell>
                            <TableCell>{u?.role || 'user'}</TableCell>
                            <TableCell>
                                <Button
                                    size='small'
                                    color='error'
                                    variant='outlined'
                                    disabled={!u?.amigoSecreto}
                                    onClick={() => handleResetSecret(u.id)}
                                >
                                    Eliminar amigo secreto
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Admin;
