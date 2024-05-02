import React, { useState, useEffect } from 'react';
import './App.css';
import appFirebase from './credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './componentes/Login';
import Home from './componentes/Home';
import Admins from './componentes/Admins';
import UserDetails from './componentes/UserDetails';
import Mensualidades from './componentes/Mensualidades';
import Verificar from './componentes/Verificar';

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

  // Función para renderizar el componente apropiado en función de la URL
  const renderizarComponente = () => {
    if (usuario) {
      return <Home correoUsuario={usuario.email} />;
    } else {
      return <Login />;
    }
  };

  return (
    <div>
      {renderizarComponente()}
    </div>
  );
}

export default App;
