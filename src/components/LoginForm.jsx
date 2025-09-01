// src/components/LoginForm.jsx
import { useState } from "react";
import { Button, Container, Typography, Box, TextField } from "@mui/material";

function LoginForm({ onLogin }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== "") {
      onLogin({ displayName: name, photoURL: null }); // simulamos un "user"
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        🎁 Amigo Secreto
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Entrar
        </Button>
      </Box>
    </Container>
  );
}

export default LoginForm;
