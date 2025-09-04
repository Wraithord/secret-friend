import {
    TableBody,
    IconButton,
    Container, Paper, 
    Table, TableHead,
    Typography, Stack, 
    TextField, Button, 
    TableRow, TableCell,
    Divider, TableContainer, 
    Avatar, Dialog, DialogContent,
} from '@mui/material';
import Loading from '../Loading';
import { db } from '../../firebase/config';
import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

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
            const allUsers = snapshot?.docs?.map(doc => ({ 
                id: doc?.id,
                ...doc?.data(),
            }));
            setUsers(allUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        };
    };

    const handleCreateUser = async () => {
        if (!name?.trim() || !email?.trim()) return alert('Nombre y correo son requeridos');
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
            console.log('Usuario creado correctamente');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        };
    };

    if (fetching) return <Loading/>;

    return (
        <Container maxWidth='md' sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant='h4' align='center' sx={{ mb: 4, fontWeight: 'bold' }}>
                    {`Panel de Administración`}
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
                <UsersTable users={users} setUsers={setUsers}/>
            </Paper>
        </Container>
    );
};

function UsersTable({ users, setUsers }) {
    const sortedUsers = users?.slice()?.sort((a, b) => {
        if (!a?.name) return 1;
        if (!b?.name) return -1;
        return a?.name?.localeCompare(b?.name);
    });

    const checkDuplicates = (users) => {
        const counts = {};
        const duplicates = new Set();
    
        users.forEach(u => {
            const secretId = u?.amigoSecreto?.id;
            if (secretId) {
                counts[secretId] = (counts[secretId] || 0) + 1;
                if (counts[secretId] > 1) {
                    duplicates.add(secretId);
                }
            }
        });
    
        return Array.from(duplicates);
    };

    const duplicateIds = checkDuplicates(sortedUsers);
    const hasDuplicates = duplicateIds?.length > 0;

    console.log('sortedUsers:', sortedUsers);

    const handleResetSecret = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                amigoSecreto: null,
                hasSpun: false,
            });
    
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, amigoSecreto: null, hasSpun: false } : u
            ));
    
            console.log('Amigo secreto borrado correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al borrar amigo secreto');
        };
    };

    const handleUploadPhoto = async (e, userId) => {
        const file = e?.target?.files[0];
        if (!file) return;
    
        try {
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
    
            const base64 = await toBase64(file);
    
            await updateDoc(doc(db, 'users', userId), {
                photoBase64: base64,
            });
    
            setUsers((prev) =>
                prev?.map((u) =>
                    u?.id === userId ? { ...u, photoBase64: base64 } : u
                )
            );
    
            console.log('Foto guardada en Firestore (Base64)');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la foto');
        }
    };    

    const handleAssignUser = async (myUserId) => {
        try {
            const idUser = '3sb0zQhZfM1aV4MCvm5G';
    
            const userDoc = await getDoc(doc(db, 'users', idUser));
            if (!userDoc?.exists()) {
                alert('El usuario no existe en la base de datos.');
                return;
            };
    
            const userData = { id: userDoc?.id, ...userDoc?.data() };
    
            await updateDoc(doc(db, 'users', myUserId), {
                hasSpun: true,
                amigoSecreto: {
                    id: userData?.id,
                    name: userData?.name,
                    email: userData?.email || null,
                    photoBase64: userData?.photoBase64 || null,
                },
            });
    
            setUsers((prev) =>
                prev?.map((u) => u?.id === myUserId
                    ? {
                        ...u,
                        amigoSecreto: {
                            id: userData?.id,
                            name: userData?.name,
                            email: userData?.email || null,
                            photoBase64: userData?.photoBase64 || null,
                        },
                        hasSpun: true,
                    } : u,
                ),
            );
            console.log('Usuario fue asignado como tu amigo secreto (modo admin testing).');
            alert('Tienes un amigo secreto 🎉 (modo admin testing)');
        } catch (err) {
            console.error(err);
            alert('Error al asignar a Brenda como amigo secreto');
        };
    };

    return (
        <>
            {hasDuplicates && (
                <Paper sx={{ p: 2, mb: 2, backgroundColor: "#ffe6e6" }}>
                    <strong>⚠ Atención:</strong> Hay usuarios repetidos como amigo secreto.
                </Paper>
            )}
            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align='center'>#</TableCell>
                            <TableCell align='center'>Avatar</TableCell>
                            <TableCell align='center'>Nombre</TableCell>
                            <TableCell align='center'>Correo</TableCell>
                            <TableCell align='center'>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers?.map((u, index) => {
                            const isDuplicate = duplicateIds.includes(u?.amigoSecreto?.id);
                            return (
                                <TableRow 
                                    key={u?.id} 
                                    sx={isDuplicate ? { backgroundColor: '#fff0f0' } : {}}
                                >
                                    <TableCell align='center'>{index + 1}</TableCell>
                                    <TableCell align='center'>
                                        <AvatarWithZoom user={u} />
                                    </TableCell>
                                    <TableCell align='center'>
                                        {u?.name}
                                        {isDuplicate && (
                                            <Typography variant="caption" color="error" display="block">
                                                {`⚠ Amigo secreto repetido`}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align='center'>{u?.email}</TableCell>
                                    <TableCell align='center'>
                                        <Button
                                            size='small'
                                            color='error'
                                            variant='text'
                                            disabled={!u?.amigoSecreto}
                                            onClick={() => handleResetSecret(u?.id)}
                                            sx={{ ':hover': { color: '#fff', backgroundColor: 'red' } }}
                                        >
                                            <DeleteIcon/>
                                        </Button>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            style={{ display: 'none' }}
                                            id={`upload-photo-${u?.id}`}
                                            onChange={(e) => handleUploadPhoto(e, u?.id)}
                                        />
                                        <label htmlFor={`upload-photo-${u.id}`}>
                                            <IconButton color='primary' component='span'>
                                                <AddPhotoAlternateIcon/>
                                            </IconButton>
                                        </label>
                                        {/* {u?.role === 'admin' && ( */}
                                            <Button
                                                size='small'
                                                variant='text'
                                                color='success'
                                                onClick={() => handleAssignUser(u?.id)}
                                                sx={{ ':hover': { color: '#fff', backgroundColor: 'green' } }}
                                            >
                                                <PersonAddIcon/>
                                            </Button>
                                        {/* )} */}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default Admin;

function AvatarWithZoom({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Avatar
                src={user?.photoBase64}
                alt={user?.name}
                sx={{
                    width: 40,
                    height: 40,
                    margin: "0 auto",
                    cursor: "pointer",
                }}
                onClick={() => setOpen(true)}
            >
                {!user?.photoBase64 && (user?.name?.[0] || "?")}
            </Avatar>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent sx={{ position: "relative", p: 2 }}>
                    <IconButton
                        onClick={() => setOpen(false)}
                        sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <img
                        src={user?.photoBase64}
                        alt={user?.name}
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "80vh",
                            borderRadius: "8px",
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}