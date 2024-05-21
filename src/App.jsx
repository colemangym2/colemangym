import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import appFirebase from './credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './componentes/Login';
import Home from './componentes/Home';
import Admins from './componentes/Admins';
import Mensualidades from './componentes/Mensualidades';
import NavBar from './componentes/NavBar';
import UserDetails from './componentes/UserDetails';

const auth = getAuth(appFirebase);

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
      } else {
        setUsuario(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUsuario(null);
  };

  return (
    <Router>
      {usuario && window.location.pathname !== '/login' && <NavBar onLogout={handleLogout} />}
      {usuario && (
        <Routes>
          <Route path="/home" element={<Home correoUsuario={usuario.email} />} />
          <Route path="/mensualidades" element={<Mensualidades />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/user/:userId" element={<UserDetails />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      )}
      {!usuario && (
        <Routes basename="/colemangym">
          <Route path="/login" element={<Login onLogin={setUsuario} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}
export default App;