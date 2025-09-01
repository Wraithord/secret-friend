import { auth, firebaseInitialized } from './firebase/config.js';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import Home from './components/Home/Home.jsx';
import Loading from './components/Loading.jsx';
import Roulette from './components/Roulette.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import Register from './components/Register/Register.jsx';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firebaseInitialized || !auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        }, error => {
            console.error('Error en onAuthStateChanged:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await auth.signOut();
            setCurrentUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    if (loading) return <Loading/>;
    if (!firebaseInitialized) return <ErrorPage message='Firebase no está configurado. Revisar variables de entorno.'/>;

    return (
        <Router>
            <nav style={{ padding: '1rem', textAlign: 'center' }}>
                <Link to='/home' style={{ margin: '0 1rem' }}>Inicio</Link>
                {currentUser && <Link to='/roulette' style={{ margin: '0 1rem' }}>Ruleta</Link>}
                {currentUser ? (
                    <button onClick={handleLogout} style={{ margin: '0 1rem' }}>Cerrar sesión</button>
                ) : (
                    <Link to='/register' style={{ margin: '0 1rem' }}>Iniciar sesión / Registro</Link>
                )}
            </nav>

            <Routes>
                <Route path='/' element={<Navigate to='/home' replace />} />
                <Route path='/home' element={<Home currentUser={currentUser} />} />
                <Route path='/register' element={currentUser ? <Navigate to='/roulette' replace /> : <Register />} />
                <Route path='/roulette' element={currentUser ? <Roulette /> : <Navigate to='/register' replace />} />
                <Route path='*' element={<Navigate to='/home' replace />} />
            </Routes>
        </Router>
    );
};

export default App;