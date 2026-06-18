/**
 * @fileoverview Contexto de Autenticación
 * 
 * ¿QUÉ ES UN "CONTEXT" EN REACT?
 * Es una forma de compartir datos (como "quién está logueado") con
 * CUALQUIER componente de la app, sin tener que pasarlo manualmente
 * de componente en componente ("prop drilling").
 * 
 * Sin Context: tendrías que pasar el usuario como prop desde App.jsx
 * hasta Navbar.jsx, hasta ProfileMenu.jsx, etc — aunque ninguno de los
 * componentes intermedios lo necesite.
 * 
 * Con Context: cualquier componente llama useAuth() y obtiene
 * el usuario directamente, sin importar qué tan anidado esté.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserModel } from "../models/User";
import { usuarioService } from "../services/usuarioService";

// Crea el "contenedor" del contexto. Empieza vacío (null).
const AuthContext = createContext(null);

/**
 * Este componente ENVUELVE toda la aplicación (lo ves en App.jsx).
 * Todo lo que esté DENTRO de <AuthProvider> puede acceder al usuario.
 */
export function AuthProvider({ children }) {
  // user: null si nadie ha iniciado sesión, o un UserModel si sí
  const [user, setUser] = useState(null);

  // loading: true mientras Firebase está verificando si hay una sesión
  // guardada (esto tarda una fracción de segundo al cargar la página)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * onAuthStateChanged es la función MÁGICA de Firebase:
     * se ejecuta automáticamente CADA VEZ que el estado de sesión cambia:
     * - Cuando el usuario hace login
     * - Cuando el usuario hace logout
     * - Cuando la página se recarga y Firebase recuerda la sesión guardada
     * 
     * Esto es lo que hace que NO tengas que volver a loguearte
     * cada vez que recargas la página — Firebase guarda la sesión
     * en el navegador automáticamente.
     */
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Hay sesión activa: sincroniza este usuario con la tabla
        // "usuarios" de Supabase (para que también exista ahí,
        // ya que Firebase solo maneja el login, no los datos del cliente)
        await usuarioService.sincronizar(firebaseUser);

        // Convierte el usuario "crudo" de Firebase a nuestro UserModel
        setUser(new UserModel({
          uid:         firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email:       firebaseUser.email,
          photoURL:    firebaseUser.photoURL,
        }));
      } else {
        // No hay sesión: el usuario cerró sesión o nunca inició sesión
        setUser(null);
      }
      setLoading(false); // Firebase ya terminó de verificar
    });

    // Esto es "limpieza": cuando el componente se desmonta,
    // cancela la suscripción para evitar fugas de memoria
    return () => unsub();
  }, []); // [] significa: ejecuta este efecto SOLO UNA VEZ al montar

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* No renderiza nada de la app hasta que Firebase confirme
          si hay sesión o no — evita el "parpadeo" donde se ve
          el botón "Login" por un instante y luego cambia a "Hola, Daniel" */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Este es el "atajo" que usan los componentes para leer el usuario.
 * En vez de escribir useContext(AuthContext) en cada archivo,
 * simplemente escriben: const { user } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
