import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, getDocs, updateDoc, collection } from "firebase/firestore";
import { Container, Typography, Paper, Button } from "@mui/material";

function Roulette() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Usuario logueado
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({ id: currentUser.uid, ...userDoc.data() });

        // Todos los usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(usersList);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const spin = async () => {
    if (!user) return;

    // Ya tiene amigo secreto
    if (user.hasSpun && user.amigoSecreto) return;

    // Filtrar posibles receptores
    const possibleReceivers = users.filter(u =>
      u.id !== user.id &&
      !users.some(g => g.amigoSecreto?.id === u.id)
    );

    if (possibleReceivers.length === 0) return;

    const receiver = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)];

    // Guardar en Firestore
    await updateDoc(doc(db, "users", user.id), {
      amigoSecreto: { id: receiver.id, name: receiver.name },
      hasSpun: true
    });

    // Actualizar estado local
    setUser(prev => ({ ...prev, amigoSecreto: receiver, hasSpun: true }));
  };

  if (loading) return <Typography>...Cargando</Typography>;

  // Si ya tiene amigo secreto, mostrar directamente
  if (user?.hasSpun && user?.amigoSecreto) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5">
            Tu Amigo Secreto es: {user.amigoSecreto.name}
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Si aún no ha tirado, mostrar botón
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ruleta del Amigo Secreto
        </Typography>
        <Button variant="contained" color="secondary" onClick={spin}>
          Girar Ruleta
        </Button>
      </Paper>
    </Container>
  );
}

export default Roulette;
