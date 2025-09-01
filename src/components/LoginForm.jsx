import { useState } from 'react';
import { Button, Container, Typography, Box, TextField } from '@mui/material';

function LoginForm({ onLogin }) {
  const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (name?.trim() !== '') {
            onLogin({ displayName: name, photoURL: null });
        };
    };

  return (
        <Container maxWidth='sm' sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant='h4' gutterBottom>
                {`Amigo Secreto`}
            </Typography>
            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <TextField
                    fullWidth
                    value={name}
                    margin='normal'
                    label='Tu nombre'
                    onChange={(e) => setName(e?.target?.value)}
                />
                <Button type='submit' variant='contained' color='primary'>
                    {`Entrar`}
                </Button>
            </Box>
        </Container>
    );
}

export default LoginForm;