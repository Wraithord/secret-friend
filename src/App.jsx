import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { auth } from "./firebase/config";

import Home from "./components/Home/Home.jsx";
import Register from "./components/Register/Register.jsx";
import Roulette from "./components/Roulette.jsx";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null);
  };

  return (
    <Router>
      <nav style={{ padding: "1rem", textAlign: "center" }}>
        <Link to="/home" style={{ margin: "0 1rem" }}>Inicio</Link>
        {!currentUser && <Link to="/register" style={{ margin: "0 1rem" }}>Registro / Login</Link>}
        {currentUser && <Link to="/roulette" style={{ margin: "0 1rem" }}>Ruleta</Link>}
        {currentUser && <button onClick={handleLogout} style={{ margin: "0 1rem" }}>Cerrar sesión</button>}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home currentUser={currentUser} />} />
        <Route path="/register" element={currentUser ? <Navigate to="/roulette" replace /> : <Register />} />
        <Route path="/roulette" element={currentUser ? <Roulette /> : <Navigate to="/register" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
