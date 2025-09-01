import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Container, Typography, TextField, Button, Paper, Stack } from "@mui/material";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registro
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) return;
    setLoading(true);

    try {
      let userCredential;

      if (isLogin) {
        // LOGIN
        userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Revisar si existe en Firestore, si no crear
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Sin nombre",
            email,
            createdAt: new Date(),
            hasSpun: false,
            amigoSecreto: null
          });
        }

      } else {
        // REGISTRO
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Guardar en Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          createdAt: new Date(),
          hasSpun: false,
          amigoSecreto: null
        });
      }

      navigate("/roulette");

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5">{isLogin ? "Iniciar sesión" : "Registro"}</Typography>

          {!isLogin && (
            <TextField
              label="Nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
            />
          )}

          <TextField
            label="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />

          <Button variant="contained" onClick={handleAuth} disabled={loading}>
            {loading ? "Procesando..." : isLogin ? "Iniciar sesión" : "Registrarse"}
          </Button>

          <Button
            onClick={() => setIsLogin(!isLogin)}
            variant="text"
            color="secondary"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Register;