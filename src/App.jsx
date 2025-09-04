import { useState, useEffect } from 'react';
import { auth, db, firebaseInitialized } from './firebase/config.js';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import Home from './components/Home/Home.jsx';
import Loading from './components/Loading.jsx';
import Admin from './components/Admin/Admin.jsx';
import { doc, getDoc } from 'firebase/firestore';
import ErrorPage from './components/ErrorPage.jsx';
import SecretFriend from './components/SecretFriend.jsx';
import Register from './components/Register/Register.jsx';

function App() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        if (!firebaseInitialized || !auth) {
            setLoading(false);
            return;
        };

        const unsubscribe = auth.onAuthStateChanged(async user => {
            setCurrentUser(user);

            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setCurrentUserRole(userDoc.data().role || 'user');
                    } else {
                        setCurrentUserRole('user');
                    }
                } catch (error) {
                    console.error('Error al obtener rol del usuario:', error);
                    setCurrentUserRole('user');
                }
            } else {
                setCurrentUserRole(null);
            };

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
            setCurrentUserRole(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    if (loading) return <Loading/>;
    if (!firebaseInitialized) return <ErrorPage message='Firebase no está configurado. Revisar variables de entorno.'/>;

    return (
        <Router>
            <nav style={{ padding: '1rem', textAlign: 'center', justifyItems: 'center', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                <Link to='/home'>Inicio</Link>
                {currentUser ? (
                    <>
                        {currentUserRole === 'admin' && (
                            <Link to='/admin' style={{ margin: '0 1rem' }}>Administración</Link>
                        )}
                        <button onClick={handleLogout} style={{ margin: '0 1rem' }}>Cerrar sesión</button>
                    </>
                ) : (
                    <Link to='/register'>Iniciar sesión / Registro</Link>
                )}
            </nav>
            <Routes>
                <Route path='/' element={<Navigate to='/home' replace />} />
                <Route path='/home' element={<Home currentUser={currentUser} currentUserRole={currentUserRole} />} />
                <Route path='/register' element={currentUser ? <Navigate to='/secretFriend' replace /> : <Register />} />
                <Route path='/secretFriend' element={currentUser ? <SecretFriend /> : <Navigate to='/register' replace />} />
                <Route path='/admin' element={currentUser && currentUserRole === 'admin' ? <Admin /> : <Navigate to='/home' replace />} />
                <Route path='*' element={<Navigate to='/home' replace />} />
            </Routes>
        </Router>
    );
};

export default App;