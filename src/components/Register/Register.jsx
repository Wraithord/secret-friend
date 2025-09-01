import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

                const userDoc = await getDoc(doc(db, 'users', userCredential?.user?.uid));
                if (!userDoc?.exists()) {
                    await setDoc(doc(db, 'users', userCredential?.user?.uid), {
                        email,
                        hasSpun: false,
                        amigoSecreto: null,
                        name: 'Sin nombre',
                        createdAt: new Date(),
                    });
                };
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential?.user?.uid), {
                    name,
                    email,
                    hasSpun: false,
                    amigoSecreto: null,
                    createdAt: new Date(),
                });
            };
            navigate('/roulette');
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
                        type='email'
                        value={email}
                        label='Correo electrónico'
                        placeholder='ejemplo@correo.com'
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
                        variant='contained'
                        color='primary'
                        size='large'
                        onClick={handleAuth}
                        disabled={loading}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
                    </Button>
                    <Divider>o</Divider>
                    <Box textAlign='center'>
                        <Button variant='text' color='secondary' onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Register;