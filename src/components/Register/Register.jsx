// Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Container, Typography, TextField, Button, Paper, Stack, Divider, Box } from '@mui/material';

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email?.trim() || !password?.trim() || (!isLogin && !name?.trim())) return;
        setLoading(true);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                const userDocRef = doc(db, 'users', userCredential?.user?.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        name: userCredential?.user?.displayName || 'Sin nombre',
                        email,
                        role: 'user',
                        hasSpun: false,
                        amigoSecreto: null,
                        createdAt: new Date(),
                    });
                };
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential?.user, { displayName: name });
                await setDoc(doc(db, 'users', userCredential?.user?.uid), {
                    name,
                    email,
                    hasSpun: false,
                    amigoSecreto: null,
                    role: 'user',
                    createdAt: new Date(),
                });
            };
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        };
    };

    return (
        <Container maxWidth='sm' sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <form onSubmit={e => { 
                    e.preventDefault(); 
                    handleAuth(); 
                }}>
                    <Stack spacing={2}>
                        <Typography variant='h4' align='center' sx={{ mb: 3, fontWeight: 'bold' }}>
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                        </Typography>
                        {!isLogin && (
                            <TextField
                                fullWidth
                                value={name}
                                label='Nombre completo'
                                placeholder='Tu nombre'
                                onChange={e => setName(e.target.value)}
                            />
                        )}
                        <TextField
                            fullWidth
                            type="email"
                            value={email}
                            name="userEmail"
                            autoComplete="email"
                            label="Correo electrónico"
                            placeholder="ejemplo@correo.com"
                            onChange={e => setEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            type='password'
                            value={password}
                            label='Contraseña'
                            placeholder='********'
                            onChange={e => setPassword(e.target.value)}
                        />
                        <Button
                            type='submit'
                            size='large'
                            color='primary'
                            disabled={loading}
                            variant='contained'
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
                        </Button>
                        <Divider>o</Divider>
                        <Box textAlign='center'>
                            <Button
                                variant='text'
                                color='primary'
                                onClick={() => setIsLogin(!isLogin)}
                                sx={{ fontWeight: 'bold', ':hover': { color: '#fff' } }}
                            >
                                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default Register;